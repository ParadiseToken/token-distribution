
var ParadiseToken = artifacts.require("./ParadiseToken.sol");
var ParadiseTokenSale = artifacts.require("./ParadiseTokenSale.sol");
var bigInt = require("big-integer");


const timeTravel = function (time) {
  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync({
      jsonrpc: "2.0",
      method: "evm_increaseTime",
      params: [time], // 86400 is num seconds in day
      id: new Date().getTime()
    }, (err, result) => {
      if(err){ return reject(err) }
      return resolve(result)
    });
  })
}

contract('ParadiseToken (Basic Tests)', function(accounts) {
  // account[0] points to the owner on the testRPC setup
  var owner = accounts[0];
  var user1 = accounts[1];
  var user2 = accounts[2];
  var user3 = accounts[3];

  beforeEach(function() {
    return ParadiseTokenSale.deployed().then(function(instance) {
        offering = instance;
        return ParadiseToken.deployed();
    }).then(function(instance2){
      token = instance2;
      return token.InitialSupplyCup();
    });
  });

  it("should have 18 decimal places", async function() {
    var decimals = await token.decimals();
    assert.equal(decimals, 18);
  });

  it("transferEnabled is initialized to false", async function() {
    var result = await token.transferEnabled();
    assert.equal(result, false);
  });

  it("should have an initial owner balance of 300 Mil tokens", async function() {
      let ownerBalance = (await token.balanceOf(owner)).toNumber();

      // Note: 300 Mil * 1 PDT => (10 ** 8) * (10 ** 18) = (10 ** 26)
      assert.equal(ownerBalance, bigInt("3e26"), "the owner balance should initially be 300 Mil tokens");
  });

  it("should not allow a regular user to transfer before they are enabled", async function() {
      try{
        await token.transfer(user2, 10, {from: user1});
      }
      catch (e){
        return true;
      }
      throw new Error("a regular user transferred before they were enabled")
  });

  it("should not allow a regular user to enable transfers", async function() {
      let token = await ParadiseToken.deployed();
      try{
        await token.enableTransfer({from: user1});
      }
      catch (e){
        return true;
      }
      throw new Error("a regular user was able to call enableTransfer")
  });

  it("should enable transfers after invoking enableTransfer as owner", async function() {
      let isEnabledBefore = await token.transferEnabled();
      assert(!isEnabledBefore, "transfers should not be enabled");
      await token.enableTransfer();
      let isEnabledAfter = await token.transferEnabled();
      assert(isEnabledAfter, "transfers should be enabled");
  });

});
