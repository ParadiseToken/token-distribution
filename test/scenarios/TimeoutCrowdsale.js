
var ParadiseTokenSale = artifacts.require("./ParadiseTokenSale.sol");
var ParadiseToken = artifacts.require("./ParadiseToken.sol");
var ParadiseTokenSaleMock = artifacts.require('./helpers/ParadiseTokenSaleMock.sol');
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


async function logUserBalances (token, accounts) {
 console.log("")
 console.log("User Balances:")
 console.log("--------------")
 console.log(`Owner: ${(await token.balanceOf(accounts[0])).toNumber()}`)
 console.log(`User1: ${(await token.balanceOf(accounts[1])).toNumber()}`)
 console.log(`User2: ${(await token.balanceOf(accounts[2])).toNumber()}`)
 console.log(`User3: ${(await token.balanceOf(accounts[3])).toNumber()}`)

 console.log("--------------")
 console.log("")
}

async function logEthBalances (token, sale, accounts) {
 console.log("")
 console.log("Eth Balances:")
 console.log("-------------")
 console.log(`Owner: ${(await web3.eth.getBalance(accounts[0])).toNumber()}`)
 console.log(`User1: ${(await web3.eth.getBalance(accounts[1])).toNumber()}`)
 console.log(`User2: ${(await web3.eth.getBalance(accounts[2])).toNumber()}`)
 console.log(`User3: ${(await web3.eth.getBalance(accounts[3])).toNumber()}`)
 console.log(`Sale : ${(await web3.eth.getBalance(sale.address)).toNumber()}`)
 console.log(`Token: ${(await web3.eth.getBalance(token.address)).toNumber()}`)

 console.log("--------------")
 console.log("")
}


contract('Missed-deadline Crowdsale', function(accounts) {
  // account[0] points to the owner on the testRPC setup
  var owner = accounts[0];
  var user1 = accounts[1];
  var user2 = accounts[2];
  var user3 = accounts[3];

  var sale2;

  beforeEach(function() {
    return ParadiseTokenSale.deployed().then(function(instance) {
        offering = instance;
        return ParadiseToken.deployed();
    }).then(function(instance2){
      token = instance2;
      return token.InitialSupplyCup();
    }).then(function(val){
      initialSupply = val.toNumber();
      return sale.rate();
    }).then(function(val){
      rate = val.toNumber();
      return token.owner();
    }).then(function(owner){
      tokenOwner = owner;
      return token.TokenAllowance();
    }).then(function(val){
      crowdsaleSupply = val.toNumber();
    });
  });

  it("should accept 2 ether for the crowdsale", async function() {
      // 0 indicates all crowdsale tokens
      await token.setTokenOffering(offering.address, 0); // ensures crowdsale has allowance of tokens

      var amountEther = 2;
      var amountWei = web3.toWei(amountEther, "ether");

      let allowance = (await token.allowance(tokenOwner, offering.address)).toNumber();

      await offering.sendTransaction({from: user2,  value: web3.toWei(amountEther, "ether")});

      let allowanceAfter = (await token.allowance(tokenOwner, offering.address)).toNumber();
      let user2BalanceAfter = (await token.balanceOf(user2)).toNumber();
      let ownerBalanceAfter = (await token.balanceOf(owner)).toNumber();

      assert.equal(allowance - (amountWei * rate), allowanceAfter, "The crowdsale should have sent amountWei*rate PDT");
      assert.equal(user2BalanceAfter, amountWei * rate, "The user should have gained amountWei*rate PDT");
      assert.equal(allowanceAfter + user2BalanceAfter, allowance, "The total tokens should remain the same");
  });

  it("should not allow the purchase of tokens if the deadline is reached", async function() {
      // 0 indicates all crowdsale tokens
      var time = (new Date().getTime() / 1000);
      var futureTime = time + 130;

      var amountEther = 2;
      var amountWei = web3.toWei(amountEther, "ether");

      let offering2 = await ParadiseTokenSaleMock.new(accounts[1], 10, 20, 1, time, 2, 10000, token.address);
      await token.setTokenOffering(offering2.address, 0); // ensures crowdsale has allowance of tokens

      let nowtest = await offering2._now();

      let currentTime = (await offering2.currentTime());
      //let startTime = (await offering2.)

      currentTime = currentTime.toNumber();
      let endTime = await offering2.endTime();

      await offering2.sendTransaction({from: user2,  value: web3.toWei(amountEther, "ether")});

      await offering2.changeTime(futureTime);

      let afterTime = (await offering2.currentTime());

      try{
          await offering2.sendTransaction({from: user2,  value: web3.toWei(amountEther, "ether")});
      }
      catch (e){
        return true;
      }
      throw new Error("a user sent funds after the deadline");
  });



});
