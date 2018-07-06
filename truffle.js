
var HDWalletProvider = require("truffle-hdwallet-provider");
var infura_apikey = "< KEY >"; // Get yours at https://infura.io/signup. It's free.
var mnemonic = "< REPLACE THIS WITH YOUR METAMASK SEED PHRASES >"; 

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    ropsten:  {
      provider: new HDWalletProvider(mnemonic, "https://ropsten.infura.io/" + infura_apikey),
      port: 8546,
      network_id: 3,
    }
  },
};
