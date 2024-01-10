import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {

        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.flightSuretyData = new this.web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);
        this.appAddress = config.appAddress;
        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
    }

    async initialize(callback) {
        await this.web3.eth.getAccounts((error, accts) => {
           
            this.owner = accts[0];

            let counter = 1;
            
            while(this.airlines.length < 5) {
                this.airlines.push(accts[counter++]);
            }

            while(this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }

            this.flightSuretyData.methods.authorizeCallers(this.appAddress).send({from: this.owner}, (error, result) => {
                if(error) {
                    console.log("Could not authorize the App contract");
                    console.log(error);
                }
            });

            callback();
        });
    }

    isOperational(callback) {
       let self = this;
       self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner}, callback);
    }

    fetchFlightStatus(flight, callback) {
        let self = this;
        let payload = {
            airline: self.airlines[0],
            flight: flight,
            timestamp: Math.floor(Date.now() / 1000)
        } 
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.owner}, (error, result) => {
                callback(error, payload);
            });
    }

    async registerAirline(address, name, callback) {
        let self = this;
        let payload = {
            airlineAddress: address,
            name: name,
            sender: 0x00,
            message: null
        }
        await this.web3.eth.getAccounts((error, accts) => {
            payload.sender = accts[0];
        });
        self.flightSuretyApp.methods
            .registerAirline(payload.airlineAddress, payload.name)
            .send({ from: payload.sender,
                gas: 5000000,
                gasPrice: 20000000
            }, (error, result) => {
                if (error) {
                    console.log(error);
                    callback(error, payload);
                } else {
                    console.log(result);
                    payload.message = `Airline Registered - Address: ${payload.airlineAddress}, Name:${payload.name}`;
                    callback(error, payload);  
                }
            });
    }

    async fund(funds, callback) {
        let self = this;
        let value = this.web3.utils.toWei(funds.toString(), "ether");
        let payload = {
            funds: value,
            funder: 0x00,
            message: null
        } 
        await this.web3.eth.getAccounts((error, accts) => {
            payload.funder = accts[0];
        });
        self.flightSuretyData.methods
            .fund()
            .send({ from: payload.funder, value: value}, (error, result) => {
                if (error) {
                    console.log(error);
                    callback(error, payload);
                } else {
                    console.log(result);
                    let eth = this.web3.utils.fromWei(payload.funds, 'ether');
                    payload.message = `Funding Successful - Funder: ${payload.funder}, Value: ${eth} ETH`;
                    callback(error, payload);  
                }
            });
    }
}