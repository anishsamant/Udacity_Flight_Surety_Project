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

    fetchFlightStatus(airline, flight, callback) {
        let self = this;
        let payload = {
            airline: airline,
            flight: flight,
            timestamp: Math.floor(Date.now() / 1000)
        } 
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.owner}, (error, result) => {
                callback(error, payload);
            });
    }

    viewFlightStatus(airline, flight, callback) {
        let self = this;
        let payload = {
            airline: airline,
            flight: flight
        }
        self.flightSuretyApp.methods
            .viewFlightStatus(payload.flight, payload.airline)
            .call({ from: self.owner}, (error, result) => {
                callback(error, result);
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
                gasPrice: 200000000
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

    async voteAirline(airlineAddress, callback) {
        let self = this;
        let payload = {
            airlineAddress: airlineAddress,
            voter: 0x00,
            message: null
        } 
        await this.web3.eth.getAccounts((error, accts) => {
            payload.voter = accts[0];
        });
        self.flightSuretyApp.methods
            .voteAirline(payload.airlineAddress)
            .send({ from: payload.voter, gas: 5000000, gasPrice: 200000000}, (error, result) => {
                if (error) {
                    console.log(error);
                    callback(error, payload);
                } else {
                    console.log(result);
                    payload.message = `Vote Successful - Voter: ${payload.voter}, Airline Voted: ${airlineAddress}`;
                    callback(error, payload);  
                }
            });
    }
    
    async registerFlight(flight, destination, callback) {
        let self = this;
        let payload = {
            flight: flight,
            destination: destination,
            timestamp: Math.floor(Date.now() / 1000),
            airline: 0x00,
            airlineName: "",
            message: null
        }
        await this.web3.eth.getAccounts((error, accts) => {
            payload.airline = accts[0];
        });
        self.flightSuretyApp.methods
            .registerFlight(payload.flight, payload.destination, payload.timestamp)
            .send({ from: payload.airline, gas: 5000000, gasPrice: 200000000}, (error, result) => {
                if (error) {
                    console.log(error);
                    callback(error, payload);
                } else {
                    payload.message = `Flight Registered - FlightNumber: ${payload.flight}, Airline: ${payload.airline}`;
                    self.flightSuretyData.methods.getAirlineName(payload.airline).call({ from: self.owner }, (error, result) => {
                        if (!error) {
                            payload.airlineName = result;
                        } else {
                            payload.airlineName = "Unable to fetch";
                        }
                        callback(error, payload);
                    });
                }
            });
    }

    async buy(flight, price, callback) {
        let self = this;
        let priceInWei = this.web3.utils.toWei(price.toString(), "ether");
        let payload = {
            flight: flight,
            price: priceInWei,
            passenger: 0x00,
            message: null
        } 
        await this.web3.eth.getAccounts((error, accts) => {
            payload.passenger = accts[0];
        });
        self.flightSuretyData.methods
            .buy(flight)
            .send({ from: payload.passenger, value: priceInWei,
                gas: 5000000,
                gasPrice: 200000000
            }, (error, result) => {
                if (error) {
                    console.log(error);
                    callback(error, payload);
                } else {
                    console.log(result);
                    let eth = this.web3.utils.fromWei(payload.price, 'ether');
                    payload.message = `Insurance purchase successful - FlightNumber: ${payload.flight}, amount: ${eth} ETH`;
                    callback(error, payload);
                }
            });
    }

    async getCreditToPay(flight, callback) {
        let self = this;
        let payload = {
            flight: flight,
            passenger: 0x00,
            message: null
        } 
        await this.web3.eth.getAccounts((error, accts) => {
            payload.passenger = accts[0];
        });
        self.flightSuretyData.methods.
        getCreditToPay(payload.flight).call({ from: payload.passenger, gas: 5000000, gasPrice: 200000000}, (error, result) => {
            if (error) {
                console.log(error);
                callback(error, payload);
            } else {
                console.log(result)
                let eth = this.web3.utils.fromWei(result, 'ether');
                payload.message = `Your credit to redeem for flight: ${flight} is ${eth} ETH`;
                callback(error, payload);
            }
        });
    }

    async pay(flight, callback) {
        let self = this;
        let payload = {
            flight: flight,
            passenger: 0x00,
            message: null
        }
        await this.web3.eth.getAccounts((error, accts) => {
            payload.passenger = accts[0];
        });
        self.flightSuretyData.methods.
        pay(payload.flight).send({ from: payload.passenger, gas: 5000000, gasPrice: 200000000}, (error, result) => {
            if (error) {
                console.log(error);
                callback(error, payload);
            } else {
                console.log(result)
                payload.message = `Credit for flight: ${flight} successfully withdrawn`;
                callback(error, payload);
            }
        });
    }

}