# Udacity_Flight_Surety_Project
This project is from the Udacity Blockchain Developer Nanodegree - Project: Flight Surety


### Getting Started
1. Clone the project: <br>
`$ git clone https://github.com/anishsamant/Udacity_Flight_Surety_Project.git`

2. Cd into project directory: <br>
`$ cd Udacity_Flight_Surety_Project`

3. From the  project parent directory install dependencies: <br>
`$ npm install`

4. Launch ganache GUI <br>
![ganache_gui](https://github.com/anishsamant/Udacity_Ethereum_DAPP_SCM_Project/assets/21247634/271fcc13-b4a5-44b1-b498-8d145632500f)

5. Compile and migrate contract <br>
`$ truffle compile` <br>
`$ truffle migrate --reset` <br>

6. Test the contract <br>
`$ truffle test ./test/flightSurety.js` <br>
`$ truffle test ./test/oracles.js` <br>
![truffle_test](https://github.com/anishsamant/Udacity_Ethereum_DAPP_SCM_Project/assets/21247634/4b31cb19-c675-4072-ae7e-b3a09cdb3eea)

7. In a separate terminal window, launch the DApp <br>
`$ npm run dapp`

8. In a separate terminal window, launch the server <br>
`$ npm run server`


### Program Versions
1. <b>Truffle v5.11.5 (core: 5.11.5)</b> <br>
Truffle is a development framework for Ethereum that simplifies the process of building, testing, and deploying smart contracts.

2. <b>Ganache v7.9.1</b> <br>
Ganache is a personal blockchain for Ethereum development, providing a local testing environment with configurable settings for testing smart contracts.

3. <b>Solidity - 0.8.0 (solc-js)</b> <br>
Solidity is a programming language for writing smart contracts on the Ethereum blockchain, and solc-js is the Solidity compiler for JavaScript, used to compile Solidity code into bytecode.

4. <b>Node v20.9.0</b> <br>
Node.js is a JavaScript runtime that allows developers to execute server-side JavaScript code. It is commonly used in Ethereum development for running server-side scripts and tools.

5. <b>Web3.js v1.10.0</b> <br>
Web3.js is a JavaScript library that provides an interface for interacting with the Ethereum blockchain. It allows developers to build decentralized applications (DApps) by connecting to Ethereum nodes and sending transactions or reading data from the blockchain.
