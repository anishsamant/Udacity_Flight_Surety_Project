var HDWalletProvider = require("@truffle/hdwallet-provider");
var mnemonic = "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";

module.exports = {
  networks: {
    development: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "http://127.0.0.1:8545/", 0, 30);
      },
      network_id: '*',
      // networkCheckTimeout: 1000000000,
      // timeoutBlocks: 200000, 
    }
  },
  compilers: {
    solc: {
      version: "0.8.0"
    }
  }
};