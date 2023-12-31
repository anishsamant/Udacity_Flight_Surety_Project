// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FlightSuretyData {

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false

    struct Airline {
        string name;
        bool isRegistered;
        uint funding;
    }

    mapping(address => Airline) airlines;
    uint private airlinesCount;

    mapping(address => uint) private votes;
    mapping(address => address[]) private airlineVoters;

    mapping(address => uint) authorizedCallers;
    
    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/

    event AuthorizedContract(address indexed addr);
    event DeAuthorizedContract(address indexed addr);


    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor(address _airlineAddress) {
        contractOwner = msg.sender;
        airlines[_airlineAddress] = Airline({
            name: "Genesis Air",
            isRegistered: true,
            funding: 0 
        });
        airlinesCount++;
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in 
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner() {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    modifier requireIsAuthorizedCaller() {
        require(authorizedCallers[msg.sender] == 1, "Caller is not authorized");
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */      
    function isOperational() 
                            public 
                            view 
                            returns(bool) 
    {
        return operational;
    }


    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */    
    function setOperatingStatus
                            (
                                bool mode
                            ) 
                            external
                            requireContractOwner 
    {
        operational = mode;
    }

    function authorizeCallers(address _address) external requireContractOwner {
        authorizedCallers[_address] = 1;
        emit AuthorizedContract(_address);
    }

    function deAuthorizeContract(address _address) external requireContractOwner {
        delete authorizedCallers[_address];
        emit DeAuthorizedContract(_address);
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   
    function registerAirline(address _airlineAddress, string memory _name) external requireIsOperational requireIsAuthorizedCaller {
        airlines[_airlineAddress] = Airline({
            name: _name,
            isRegistered: true,
            funding: 0
        });
        airlinesCount++;
    }


   /**
    * @dev Buy insurance for a flight
    *
    */   
    function buy
                            (                             
                            )
                            external
                            payable
    {

    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
                                (
                                )
                                external
                                pure
    {
    }
    

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay
                            (
                            )
                            external
                            pure
    {
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   
    function fund() public payable {
        require(airlines[msg.sender].isRegistered, "Airline is not registered");
        airlines[msg.sender].funding += msg.value;
    }

    function getFlightKey
                        (
                            address airline,
                            string memory flight,
                            uint256 timestamp
                        )
                        pure
                        internal
                        returns(bytes32) 
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    receive() external payable {
        fund();
    }

    function isAirlineRegistered(address _airlineAddress) public view returns (bool) {
        return airlines[_airlineAddress].isRegistered;
    }

    function getAirlineFunding(address _airlineAddress) public view returns (uint) {
        return airlines[_airlineAddress].funding;
    }

    function setAirlineFunding(address _airlineAddress, uint amount) public {
        airlines[_airlineAddress].funding += amount;
    }


    function getAirlinesCount() public view returns (uint) {
        return airlinesCount;
    }

    function getVotes(address _airlineAddress) public view returns (uint) {
        return votes[_airlineAddress];
    }

    function setVotes(address _airlineAddress) public {
        votes[_airlineAddress] += 1;
    }

    function getAirlineVoters(address _airlineAddress) public view returns (address[] memory) {
        return airlineVoters[_airlineAddress];
    }

    function setAirlineVoters(address _airlineAddress,address voter) public {
        airlineVoters[_airlineAddress].push(voter);
    }
    
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    function getAirlineName(address _airlineAddress) public view returns (string memory) {
        return airlines[_airlineAddress].name;
    }

    function getAirlineInfo(address _airlineAddress) public view returns (string memory name, bool isRegistered, uint funding) {
        Airline memory airline = airlines[_airlineAddress];
        name = airline.name;
        isRegistered = airline.isRegistered;
        funding = airline.funding;
    }
}

