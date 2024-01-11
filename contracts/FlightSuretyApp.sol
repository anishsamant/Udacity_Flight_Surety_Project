// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// It's important to avoid vulnerabilities due to numeric overflow bugs
// OpenZeppelin's SafeMath library, when used correctly, protects agains such bugs
// More info: https://www.nccgroup.trust/us/about-us/newsroom-and-events/blog/2018/november/smart-contract-insecurity-bad-arithmetic/

import "./FlightSuretyData.sol";

/************************************************** */
/* FlightSurety Smart Contract                      */
/************************************************** */
contract FlightSuretyApp {

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    // Flight status codees
    uint8 private constant STATUS_CODE_UNKNOWN = 0;
    uint8 private constant STATUS_CODE_ON_TIME = 10;
    uint8 private constant STATUS_CODE_LATE_AIRLINE = 20;
    uint8 private constant STATUS_CODE_LATE_WEATHER = 30;
    uint8 private constant STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 private constant STATUS_CODE_LATE_OTHER = 50;

    uint8 private constant MULTIPARTY_CONSENSUS_MIN_AIRLINES = 4;
    uint private constant MIN_FUNDING = 10 ether;

    address private contractOwner;          // Account used to deploy contract

    struct Flight {
        bool isRegistered;
        uint8 statusCode;
        uint256 updatedTimestamp;        
        address airline;
        string flightNumber;
        string destination;
    }
    mapping(bytes32 => Flight) private flights;

    FlightSuretyData flightSuretyData;


    event RegisteredAirline(address indexed airlineAddress, string name);
    event FlightRegistered(string flightNumber, address indexed airlineAddress);

 
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
    modifier requireIsOperational() 
    {
         // Modify to call data contract's status
        require(flightSuretyData.isOperational(), "Contract is currently not operational");  
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    /********************************************************************************************/
    /*                                       CONSTRUCTOR                                        */
    /********************************************************************************************/

    /**
    * @dev Contract constructor
    *
    */
    constructor(address dataAddress) {
        contractOwner = msg.sender;
        flightSuretyData = FlightSuretyData(payable(dataAddress));
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    function isOperational() public view returns(bool) {
        return flightSuretyData.isOperational();  // Modify to call data contract's status
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

  
   /**
    * @dev Add an airline to the registration queue
    *
    */   
    function registerAirline(address _airlineAddress,string memory _name) external requireIsOperational {
        require(_airlineAddress != address(0), "Invalid address");
        require(!flightSuretyData.isAirlineRegistered(_airlineAddress), "Airline is already registered");
        uint airlinesCount = flightSuretyData.getAirlinesCount();
        if (airlinesCount <= MULTIPARTY_CONSENSUS_MIN_AIRLINES) {
            require(flightSuretyData.isAirlineRegistered(msg.sender), "Only existing airline may register a new airline");
            require(flightSuretyData.getAirlineFunding(msg.sender) >= MIN_FUNDING, "Airline does not meet minimum funding to register another airline. Contract governance denied!!!");
            flightSuretyData.registerAirline(_airlineAddress, _name);
            emit RegisteredAirline(_airlineAddress, _name);
        } else {
            require(flightSuretyData.getVotes(_airlineAddress) >= airlinesCount/2, "Need more than half votes to be registered.");
            flightSuretyData.registerAirline(_airlineAddress, _name);
            emit RegisteredAirline(_airlineAddress, _name);
        }
    }

    function voteAirline(address _airlineAddress) external requireIsOperational {
        require(flightSuretyData.getAirlineFunding(msg.sender) >= MIN_FUNDING, "Airline does not meet minimum funding to vote for another airline. Contract governance denied!!!");
        require(_airlineAddress != address(0), "Invalid address");
        require(!flightSuretyData.isAirlineRegistered(_airlineAddress), "Airline is already registered");
        address[] memory voters = flightSuretyData.getAirlineVoters(_airlineAddress);
        uint len = voters.length;
        bool voted = false;
        for (uint i = 0; i < len; i++) {
            if (voters[i] == msg.sender) {
                voted = true;
                break;
            }
        }
        require(!voted, "Caller has already voted for this airline");
        flightSuretyData.setVotes(_airlineAddress);
        flightSuretyData.setAirlineVoters(_airlineAddress,msg.sender);
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }


   /**
    * @dev Register a future flight for insuring.
    *
    */  
    function registerFlight(string memory flightNumber, string memory destination, uint timestamp) external requireIsOperational {
        bytes32 key = keccak256(abi.encodePacked(flightNumber, msg.sender));
        require(!flights[key].isRegistered, "Flight is already registered.");
        require(flightSuretyData.getAirlineFunding(msg.sender) >= MIN_FUNDING, "Airline does not meet minimum funding to register a flight. Contract governance denied!!!");

        flights[key] = Flight({
            isRegistered: true,
            statusCode: STATUS_CODE_UNKNOWN,
            updatedTimestamp: timestamp,
            airline: msg.sender,
            flightNumber: flightNumber,
            destination: destination
        });
        flightSuretyData.setFlightExistsStatus(flightNumber);

        emit FlightRegistered(flightNumber, msg.sender);
    }
    
   /**
    * @dev Called after oracle has updated flight status
    *
    */  
    function processFlightStatus(
        address airline,
        string memory flight,
        uint256 timestamp,
        uint8 statusCode
    ) internal requireIsOperational {
        bytes32 key = keccak256(abi.encodePacked(flight, airline));
        require(flights[key].isRegistered, "Flight is not registered.");

        flights[key].updatedTimestamp = timestamp;
        flights[key].statusCode = statusCode;

        if (statusCode == STATUS_CODE_LATE_AIRLINE) {
            flightSuretyData.creditInsurees(flight);
        }
    }


    // Generate a request for oracles to fetch flight information
    function fetchFlightStatus
                        (
                            address airline,
                            string memory flight,
                            uint256 timestamp                            
                        )
                        external requireIsOperational
    {
        uint8 index = getRandomIndex(msg.sender);

        // Generate a unique key for storing the request
        bytes32 key = keccak256(abi.encodePacked(index, airline, flight, timestamp));
        ResponseInfo storage newResponse = oracleResponses[key];
        newResponse.requester = msg.sender;
        newResponse.isOpen = true;

        emit OracleRequest(index, airline, flight, timestamp);
    } 

    function viewFlightStatus(string memory flight, address airline) external view requireIsOperational returns(uint8) {
        bytes32 key = keccak256(abi.encodePacked(flight, airline));
        return flights[key].statusCode;
    }


// region ORACLE MANAGEMENT

    // Incremented to add pseudo-randomness at various points
    uint8 private nonce = 0;    

    // Fee to be paid when registering oracle
    uint256 public constant REGISTRATION_FEE = 1 ether;

    // Number of oracles that must respond for valid status
    uint256 private constant MIN_RESPONSES = 3;


    struct Oracle {
        bool isRegistered;
        uint8[3] indexes;        
    }

    // Track all registered oracles
    mapping(address => Oracle) private oracles;

    // Model for responses from oracles
    struct ResponseInfo {
        address requester;                              // Account that requested status
        bool isOpen;                                    // If open, oracle responses are accepted
        mapping(uint8 => address[]) responses;          // Mapping key is the status code reported
                                                        // This lets us group responses and identify
                                                        // the response that majority of the oracles
    }

    // Track all oracle responses
    // Key = hash(index, flight, timestamp)
    mapping(bytes32 => ResponseInfo) private oracleResponses;

    // Event fired each time an oracle submits a response
    event FlightStatusInfo(address airline, string flight, uint256 timestamp, uint8 status);

    event OracleReport(address airline, string flight, uint256 timestamp, uint8 status);

    // Event fired when flight status request is submitted
    // Oracles track this and if they have a matching index
    // they fetch data and submit a response
    event OracleRequest(uint8 index, address airline, string flight, uint256 timestamp);


    // Register an oracle with the contract
    function registerOracle
                            (
                            )
                            external
                            payable
    {
        // Require registration fee
        require(msg.value >= REGISTRATION_FEE, "Registration fee is required");

        uint8[3] memory indexes = generateIndexes(msg.sender);

        oracles[msg.sender] = Oracle({
                                        isRegistered: true,
                                        indexes: indexes
                                    });
    }

    function getMyIndexes
                            (
                            )
                            view
                            external
                            returns(uint8[3] memory)
    {
        require(oracles[msg.sender].isRegistered, "Not registered as an oracle");

        return oracles[msg.sender].indexes;
    }




    // Called by oracle when a response is available to an outstanding request
    // For the response to be accepted, there must be a pending request that is open
    // and matches one of the three Indexes randomly assigned to the oracle at the
    // time of registration (i.e. uninvited oracles are not welcome)
    function submitOracleResponse
                        (
                            uint8 index,
                            address airline,
                            string memory flight,
                            uint256 timestamp,
                            uint8 statusCode
                        )
                        external
    {
        require((oracles[msg.sender].indexes[0] == index) || (oracles[msg.sender].indexes[1] == index) || (oracles[msg.sender].indexes[2] == index), "Index does not match oracle request");


        bytes32 key = keccak256(abi.encodePacked(index, airline, flight, timestamp)); 
        require(oracleResponses[key].isOpen, "Flight or timestamp do not match oracle request");

        oracleResponses[key].responses[statusCode].push(msg.sender);

        // Information isn't considered verified until at least MIN_RESPONSES
        // oracles respond with the *** same *** information
        emit OracleReport(airline, flight, timestamp, statusCode);
        if (oracleResponses[key].responses[statusCode].length >= MIN_RESPONSES) {

            emit FlightStatusInfo(airline, flight, timestamp, statusCode);

            // Handle flight status as appropriate
            processFlightStatus(airline, flight, timestamp, statusCode);
        }
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

    // Returns array of three non-duplicating integers from 0-9
    function generateIndexes
                            (                       
                                address account         
                            )
                            internal
                            returns(uint8[3] memory)
    {
        uint8[3] memory indexes;
        indexes[0] = getRandomIndex(account);
        
        indexes[1] = indexes[0];
        while(indexes[1] == indexes[0]) {
            indexes[1] = getRandomIndex(account);
        }

        indexes[2] = indexes[1];
        while((indexes[2] == indexes[0]) || (indexes[2] == indexes[1])) {
            indexes[2] = getRandomIndex(account);
        }

        return indexes;
    }

    // Returns array of three non-duplicating integers from 0-9
    function getRandomIndex
                            (
                                address account
                            )
                            internal
                            returns (uint8)
    {
        uint8 maxValue = 10;

        // Pseudo random number...the incrementing nonce adds variation
        uint8 random = uint8(uint256(keccak256(abi.encodePacked(blockhash(block.number - nonce++), account))) % maxValue);

        if (nonce > 250) {
            nonce = 0;  // Can only fetch blockhashes for last 256 blocks so we adapt
        }

        return random;
    }

// endregion

}   
