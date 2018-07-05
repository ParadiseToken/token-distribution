
var ParadiseTokenSale = artifacts.require("./ParadiseTokenSale.sol");
var ParadiseToken = artifacts.require("./ParadiseToken.sol");

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
 console.log(`Sale : ${(await web3.eth.getBalance(offering.address)).toNumber()}`)
 console.log(`Token: ${(await web3.eth.getBalance(token.address)).toNumber()}`)


 console.log("--------------")
 console.log("")
}

contract('ParadiseTokenSale Constructor', function(accounts) {
  // account[0] points to the owner on the testRPC setup
  var owner = accounts[0];
  var user1 = accounts[1];
  var user2 = accounts[2];
  var user3 = accounts[3];

  beforeEach(
    function() {
        return ParadiseTokenSale.deployed().then(
    function(instance) {
        offering = instance;
        return ParadiseToken.deployed();
    }).then(
    function(instance2){
        token = instance2;
        return token.InitialSupplyCup();
    });
  });

  it("should have the correct parameters, and calculate the end time correctly", async function() {
    let beneficiary = accounts[1];

    let tokenReward               = await offering.tokenReward();
    assert.equal(token.address, tokenReward);

    let amountRaised              = (await offering.amountRaised()).toNumber();

    assert.equal(amountRaised, 0);

    let ifSuccessfulSendTo        = await offering.beneficiary();
    let fundingGoalInEthers       = (await offering.fundingGoal()).toNumber();
    let fundingCapInEthers        = (await offering.fundingCap()).toNumber();
    let minimumContributionInWei  = (await offering.minContribution()).toNumber();
    let start                     = (await offering.startTime()).toNumber();
    let end                       = (await offering.endTime()).toNumber();
    let ratePDTToEther            = (await offering.rate()).toNumber();

    assert.equal(ifSuccessfulSendTo, beneficiary, "beneficiary address is incorrect");
    assert.equal(fundingGoalInEthers, 10 * (10 ** 18), "funding goal is incorrect");
    assert.equal(fundingCapInEthers, 20 * (10 ** 18), "funding cap is incorrect");
    assert.equal(minimumContributionInWei, 1, "minimum contribution in wei is incorrect");
    assert.equal(start + 120, end, "end time should be 120 seconds after start time");
    assert.equal(ratePDTToEther, 15000, "conversion rate from PDT to ETH is incorrect");
  });

});
