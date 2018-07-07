
var HDWalletProvider = require("truffle-hdwallet-provider");
var infura_apikey = "< KEY >"; // Get yours at https://infura.io/signup. It's free.
var mnemonic = "< REPLACE THIS WITH YOUR METAMASK SEED PHRASES >"; 

module.exports = {
  networks: {
    development: {
      provider: new HDWalletProvider(mnemonic, "http://127.0.0.1:8545/"),
      network_id: "*" // Match any network id
    },
    ropsten:  {
      provider: new HDWalletProvider(mnemonic, "https://ropsten.infura.io/" + infura_apikey),
      network_id: 3,
    }
  },
};
