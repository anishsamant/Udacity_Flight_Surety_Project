
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

const TEST_ORACLES_COUNT = 25;
const STATUS_CODE_LATE_AIRLINE = 20;

contract('Flight Surety Tests', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    await config.flightSuretyData.authorizeCallers(config.flightSuretyApp.address);
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`(multiparty) has correct initial isOperational() value`, async function () {

    // Get operating status
    let status = await config.flightSuretyData.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");

  });

  it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

      // Ensure that access is denied for non-Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
            
  });

  it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

      // Ensure that access is allowed for Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false);
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
      
  });

  it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

      await config.flightSuretyData.setOperatingStatus(false);

      let reverted = false;
      try 
      {
          await config.flightSuretyData.getBalance();
      }
      catch(e) {
          reverted = true;
      }
      assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

      // Set it back for other tests to work
      await config.flightSuretyData.setOperatingStatus(true);

  });

  it('(airline) cannot register an Airline using registerAirline() if it is not funded', async () => {
    
    // ARRANGE
    let newAirline = accounts[2];
    let name = "Emirates"
    let expectedError = "Airline does not meet minimum funding to register another airline. Contract governance denied!!!";
    let actualError = "";

    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline, name, {from: config.firstAirline});
    }
    catch(e) {
        actualError = e.reason;
    }

    // ASSERT
    assert.equal(expectedError, actualError, "Airline should not be able to register another airline if it hasn't provided funding");
  });

  it('(airline) can register another airline without voting if total airlines less than number required for consensus', async () => {
    
    // ARRANGE
    let newAirline = accounts[2];
    let name = "Emirates"
    let funds = web3.utils.toWei("10", "ether");

    // ACT
    try {
        await config.flightSuretyData.fund({from: config.firstAirline, value: funds});
        await config.flightSuretyApp.registerAirline(newAirline, name, {from: config.firstAirline});
    }
    catch(e) {
    }

    let count = await config.flightSuretyData.getAirlinesCount();

    // ASSERT
    assert.equal(count, 2, "Airline should be able to register another airline");
  });

  it('(airline) cannot register another airline without voting if total airlines more than number required for consensus', async () => {
    
    // ARRANGE
    let expectedError = "Need more than half votes to be registered.";
    let actualError = "";
    await config.flightSuretyApp.registerAirline(accounts[3], "Air India", {from: config.firstAirline});
    await config.flightSuretyApp.registerAirline(accounts[4], "Qatar", {from: config.firstAirline});
    await config.flightSuretyApp.registerAirline(accounts[5], "Etihad", {from: config.firstAirline});
    // ACT
    try {
        await config.flightSuretyApp.registerAirline(accounts[6], "Lufthansa", {from: config.firstAirline});
    }
    catch(e) {
        actualError = e.reason;
    }

    let count = await config.flightSuretyData.getAirlinesCount();

    // ASSERT
    assert.equal(actualError, expectedError, "Airline should not be able to register the fifth airline voting");
    assert.equal(count, 5, "Airline should be able to register total 5 airlines");
  });

  it('(airline) can register another airline if new airline has more than 50% votes', async () => {
    
    // ARRANGE
    let funds = web3.utils.toWei("10", "ether");
    await config.flightSuretyData.fund({from: accounts[2], value: funds});
    await config.flightSuretyData.fund({from: accounts[3], value: funds});
    await config.flightSuretyApp.voteAirline(accounts[6], {from: accounts[2]});
    await config.flightSuretyApp.voteAirline(accounts[6], {from: accounts[3]});
    await config.flightSuretyApp.voteAirline(accounts[6], {from: config.firstAirline});
    // ACT
    try {
        await config.flightSuretyApp.registerAirline(accounts[6], "Lufthansa", {from: config.firstAirline});
    }
    catch(e) {
    }

    let count = await config.flightSuretyData.getAirlinesCount();

    // ASSERT
    assert.equal(count, 6, "Airline should be able to register the next airline");
  });

  it('(airline) can register a flight', async () => {
    
    // ARRANGE
    let timestamp = Math.floor(Date.now() / 1000);
    let flight = "GA101";
    let destination = "NYC";

    // ACT
    try {
        await config.flightSuretyApp.registerFlight(flight, destination, timestamp, {from: config.firstAirline});
    }
    catch(e) {
    }

    let exists = await config.flightSuretyData.getFlightExistsStatus(flight);

    // ASSERT
    assert.equal(exists, true, "Airline should be able to register the flight");
  });

  it('(passenger) cannot purchase insurance if value sent greater than 1 ETH', async () => {
    
    // ARRANGE
    let expectedError = "Amount cannot exceed 1 ether";
    let actualError = "";
    let flight = "GA101";
    let passenger = accounts[9];

    let funds = web3.utils.toWei("2", "ether");

    // ACT
    try {
        await config.flightSuretyData.buy(flight, {from: passenger, value: funds});
    }
    catch(e) {
        actualError = e.reason;
    }

    // ASSERT
    assert.equal(actualError, expectedError, "Passenger should not be able to purchase insurance");
  });

  it('(passenger) can purchase insurance', async () => {
    
    // ARRANGE
    let flight = "GA101";
    let passenger = accounts[9];

    let funds = web3.utils.toWei("1", "ether");

    // ACT
    try {
        await config.flightSuretyData.buy(flight, {from: passenger, value: funds});
    }
    catch(e) {
    }

    let addresses = await config.flightSuretyData.getPassengerAddresses();
    let addressExists = false;
    for (let i = 0; i < addresses.length; i++) {
        if (addresses[i] == passenger) {
            addressExists = true;
            break;
        }
    }

    // ASSERT
    assert.equal(addressExists, true, "Passenger should be able to purchase insurance");
  });

  it('(passenger) can purchase insurance', async () => {
    
    // ARRANGE
    let flight = "GA101";
    let passenger = accounts[9];

    let funds = web3.utils.toWei("1", "ether");

    // ACT
    try {
        await config.flightSuretyData.buy(flight, {from: passenger, value: funds});
    }
    catch(e) {
    }

    let addresses = await config.flightSuretyData.getPassengerAddresses();
    let addressExists = false;
    for (let i = 0; i < addresses.length; i++) {
        if (addresses[i] == passenger) {
            addressExists = true;
            break;
        }
    }

    // ASSERT
    assert.equal(addressExists, true, "Passenger should be able to purchase insurance");
  });

  it("Upon startup, 20+ oracles are registered and their assigned indexes are persisted in memory", async () => {
      // ARRANGE
      let fee = await config.flightSuretyApp.REGISTRATION_FEE.call();

      // ACT
      for(let a = 0; a < TEST_ORACLES_COUNT; a++) {      
          await config.flightSuretyApp.registerOracle({ from: accounts[a], value: fee});
          let result = await config.flightSuretyApp.getMyIndexes.call({ from: accounts[a]});
          assert.equal(result.length, 3, 'Oracle should be registered with three indexes');
      }
  });

  it("Server will loop through all registered oracles, identify those oracles for which the OracleRequest event applies, and respond by calling into FlightSuretyApp contract with random status code", async () => {
      // ARRANGE
      let flight = 'GA101'; 
      let timestamp = Math.floor(Date.now() / 1000);

      await config.flightSuretyApp.fetchFlightStatus(config.firstAirline, flight, timestamp);

      for(let a = 0; a < TEST_ORACLES_COUNT; a++) {
          let oracleIndexes = await config.flightSuretyApp.getMyIndexes({from: accounts[a]});
          for(let idx = 0;idx < 3; idx++) {
              try {
                  await config.flightSuretyApp.submitOracleResponse(oracleIndexes[idx], config.firstAirline, flight, timestamp, STATUS_CODE_LATE_AIRLINE, { from: accounts[a] });
              } catch(e) {
                  // console.log('\nError', idx, oracleIndexes[idx].toNumber(), flight, flightTimestamp);
              }
          }
      }

      let flightStatus = await config.flightSuretyApp.viewFlightStatus(flight, config.firstAirline);
      assert.equal(STATUS_CODE_LATE_AIRLINE, flightStatus.toString(), 'Oracles should change flight status to 20 (late due to Airline)');
  });

  it("(passenger) receives credit of 1.5X the amount they paid, if flight is delayed due to airline fault", async () => {
      // ARRANGE
      let funds = web3.utils.toWei("1", "ether");
      let passenger = accounts[9];
      let flight = "GA101";
      let creditToPay;

      try {
          creditToPay = await config.flightSuretyData.getCreditToPay.call(flight, {from: passenger});
      } catch(e) {
      }

      const creditInWei = funds * 1.5;
      assert.equal(creditToPay, creditInWei, "Passenger should have 1.5 ETH to withdraw.");
  });
  
  it("(passenger) can withdraw the funds as credit due to airline delay", async () => {
      let passenger = accounts[9];
      let flight = "GA101";

      let creditToPay = await config.flightSuretyData.getCreditToPay.call(flight, {from: passenger});

      let passengerOriginalBalance = await web3.eth.getBalance(passenger);
      let receipt = await config.flightSuretyData.pay(flight, {from: passenger});
      let passengerFinalBalance = await web3.eth.getBalance(passenger);

      // Obtain total gas cost
      const gasUsed = Number(receipt.receipt.gasUsed);
      const tx = await web3.eth.getTransaction(receipt.tx);
      const gasPrice = Number(tx.gasPrice);
    
      let finalCredit = await config.flightSuretyData.getCreditToPay.call(flight, {from: config.firstPassenger});
    
      assert.equal(finalCredit.toString(), 0, "Passenger should have transfered the ethers to its wallet.");
      assert.equal(Number(passengerOriginalBalance) + Number(creditToPay) - (gasPrice * gasUsed), Number(passengerFinalBalance), "Passengers balance should have increased the amount it had credited");
  });
});
