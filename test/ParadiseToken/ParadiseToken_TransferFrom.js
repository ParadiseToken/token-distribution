// Unit tests for the constructor

var ParadiseToken = artifacts.require("./ParadiseToken.sol");
var ParadiseTokenSale = artifacts.require("./ParadiseTokenSale.sol");
var bigInt = require("big-integer");

contract('ParadiseToken.transferFrom', function(accounts) {
    // account[0] points to the owner on the testRPC setup
    var owner = accounts[0];
    var admin = accounts[1];
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

    it("admin should be able to transfer tokens from allowance", async function() {
        await token.transferFrom(owner, user2, 1, {from: admin});

        let user2Balance = await token.balanceOf(user2);
        assert.equal(user2Balance, 1);
    });

    it("non-admin should not be able to transfer tokens from allowance", async function() {
        try {
           await token.transferFrom(accounts[0], user3, 1, {from: user2});
        }
        catch (e) {
            return true;
        }

        throw new Error("non-admin was able to transfer a token");
    });
});
