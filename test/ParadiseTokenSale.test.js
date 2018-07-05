
const ParadiseTokenSale = artifacts.require("./ParadiseTokenSale.sol");
const ParadiseToken = artifacts.require("./ParadiseToken.sol");

var bigInt = require("big-integer");


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

async function logEthBalances (token, offering, accounts) {
 console.log("")
 console.log("Eth Balances:")
 console.log("-------------")
 console.log(`Owner: ${(await web3.eth.getBalance(accounts[0])).toNumber()}`)
 console.log(`User1: ${(await web3.eth.getBalance(accounts[1])).toNumber()}`)
 console.log(`User2: ${(await web3.eth.getBalance(accounts[2])).toNumber()}`)
 console.log(`User3: ${(await web3.eth.getBalance(accounts[3])).toNumber()}`)
 console.log(`Offering : ${(await web3.eth.getBalance(offering.address)).toNumber()}`)
 console.log(`Token: ${(await web3.eth.getBalance(token.address)).toNumber()}`)


 console.log("--------------")
 console.log("")
}

contract('Multiple Crowdsales', function(accounts) {
  // account[0] points to the owner on the testRPC setup
  var owner = accounts[0];
  var beneficiary = accounts[1];
  var user2 = accounts[2];
  var user3 = accounts[3];

  var offering2;

  beforeEach(function() {
    return ParadiseTokenSale.deployed().then(function(instance) {
        offering = instance;
        return ParadiseToken.deployed();
    }).then(function(instance2){
      token = instance2;
      return token.InitialSupplyCup();
    }).then(function(val){
      initialSupply = val.toNumber();
      return offering.rate();
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

  it("should accept another 10 ether, reaching the goal", async function() {
      var amountEther = 10;
      var amountWei = web3.toWei(amountEther, "ether");

      let allowance = (await token.allowance(tokenOwner, offering.address)).toNumber();

      await offering.sendTransaction({from: user2,  value: web3.toWei(amountEther, "ether")});

      let allowanceAfter = (await token.allowance(tokenOwner, offering.address)).toNumber();
      let user2BalanceAfter = (await token.balanceOf(user2)).toNumber();
      let ownerBalanceAfter = (await token.balanceOf(tokenOwner)).toNumber();

      assert.equal(allowance - (amountWei * rate), allowanceAfter, "The crowdsale should have sent amountWei*rate PDT");
      assert.equal(user2BalanceAfter, web3.toWei(12, "ether") * rate, "The user should have gained amountWei*rate PDT");
      assert.equal(allowanceAfter + user2BalanceAfter, crowdsaleSupply, "The total tokens should remain the same");
  });

  it("should transfer the ether balance of the sale crowdsale back to the owner", async function() {
      let offeringEthBalance = (await web3.eth.getBalance(offering.address)).toNumber();
      let beneficiaryEthBalance = (await web3.eth.getBalance(beneficiary)).toNumber();

      await offering.ownerSafeWithdrawal();

      let offeringBalanceAfter = (await web3.eth.getBalance(offering.address)).toNumber();
      let beneficiaryBalanceAfter = (await web3.eth.getBalance(beneficiary)).toNumber();

      assert.equal(offeringBalanceAfter, 0, "The crowdsale should no longer have ether associated with it");
      assert.equal(beneficiaryEthBalance + offeringEthBalance, beneficiaryBalanceAfter, "The beneficiary should have gained that amount of ether");
  });

}); 
