
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
 console.log(`Offering : ${(await web3.eth.getBalance(offering.address)).toNumber()}`)
 console.log(`Token: ${(await web3.eth.getBalance(token.address)).toNumber()}`)


 console.log("--------------")
 console.log("")
}

contract('ParadiseTokenSale setRate', function(accounts) {
  // account[0] points to the owner on the testRPC setup
  var owner = accounts[0];
  var user1 = accounts[1];
  var user2 = accounts[2];
  var user3 = accounts[3];

  it("should only be allowed to set values inside the bounds", async function() {
        var offering = await ParadiseTokenSale.deployed();
        var LOW = (await offering.LOW_RANGE_RATE()).toNumber();
        var HIGH = (await offering.HIGH_RANGE_RATE()).toNumber();

        await offering.setRate(LOW);
        var low_rate = await offering.rate();
        await offering.setRate(HIGH);
        var high_rate = await offering.rate();
        await offering.setRate(LOW + 1);
        var mid_rate = await offering.rate();

        assert.equal(low_rate, LOW, "the rate should be set to the lower bound");
        assert.equal(high_rate, HIGH, "the rate should be set to the upper bound");
        assert.equal(mid_rate, LOW + 1, "the rate should be set to some middle rate");

        try{
            await offering.setRate(LOW - 1);
            throw new Error("should not be allowed to set rate below LOW");
        }
        catch(e){ }

        try{
            await offering.setRate(HIGH + 1);
            throw new Error("should not be allowed to set rate above HIGH");
        }
        catch(e){ }

    });

});
