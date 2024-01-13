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
![ganache](https://github.com/anishsamant/Udacity_Flight_Surety_Project/assets/21247634/66a11952-33e4-4144-9205-bd7e01f2ab7c)

5. Compile and migrate contract <br>
`$ truffle compile` <br>
`$ truffle migrate --reset` <br>

6. Test the contract <br>
`$ truffle test ./test/flightSurety.js` <br>
`$ truffle test ./test/oracles.js` <br>
![flightSuretyTest](https://github.com/anishsamant/Udacity_Flight_Surety_Project/assets/21247634/cf425983-36b6-478a-b5ac-12665cb4a8f4)


7. In a separate terminal window, launch the DApp <br>
`$ npm run dapp`

8. In a separate terminal window, launch the server <br>
`$ npm run server`
![run_server](https://github.com/anishsamant/Udacity_Flight_Surety_Project/assets/21247634/981263fd-f650-4690-82b3-3b6b9dc654e5)


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

### Screenshots
### Airline Actions
<b> Airline Funding </b>
![fundingSuccess](https://github.com/anishsamant/Udacity_Flight_Surety_Project/assets/21247634/85d4cd91-e09f-4f4f-a677-14c34651d9d0)

<b> Airline Registration </b>
![airlineRegistered](https://github.com/anishsamant/Udacity_Flight_Surety_Project/assets/21247634/f8d851e6-5b98-4327-97da-5b9abbe6b1cd)

<b> Airline Voting </b>
![voteSuccess](https://github.com/anishsamant/Udacity_Flight_Surety_Project/assets/21247634/287d05ea-c4a7-4b48-a23e-7ec0ba0c7c45)

### Flight Actions
<b> Flight Registration </b>
![flightRegister](https://github.com/anishsamant/Udacity_Flight_Surety_Project/assets/21247634/60b4bad8-eeff-4316-b680-0ffd0b8a2782)

### Passenger Actions
<b> Purchase Insurance </b>
![purchase_insurance](https://github.com/anishsamant/Udacity_Flight_Surety_Project/assets/21247634/8e9f306b-404f-4a29-9183-b1c0a591b66f)

<b> Check Credit </b>
![initial_credit](https://github.com/anishsamant/Udacity_Flight_Surety_Project/assets/21247634/11de0f8c-07d3-447a-9e52-bbeb8e427df7)

<b> Update flight status to Airline Delay
![status_change_late_airline](https://github.com/anishsamant/Udacity_Flight_Surety_Project/assets/21247634/23dff575-83a1-4493-a469-bfb497eb7240)

<b> Submit Oracle Request </b>
![submit_oracle](https://github.com/anishsamant/Udacity_Flight_Surety_Project/assets/21247634/43a785cf-778c-46e1-93bd-708ff6f80fa1)
![flight_status_table](https://github.com/anishsamant/Udacity_Flight_Surety_Project/assets/21247634/127a3817-f872-416f-ab69-088b84653fe7)

<b> Claim Credit </b>
![final_credit](https://github.com/anishsamant/Udacity_Flight_Surety_Project/assets/21247634/d47d65b3-570f-4e16-b64e-347ce733c069)
![withdraw_credit](https://github.com/anishsamant/Udacity_Flight_Surety_Project/assets/21247634/04af014b-65ea-49e3-97e3-336e70d02773)

