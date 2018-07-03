
var SafeMath = artifacts.require("./math/SafeMath.sol");
var ERC20 = artifacts.require("./token/ERC20.sol");
var ERC20Basic = artifacts.require("./token/ERC20Basic.sol");
var BasicToken = artifacts.require("./token/BasicToken.sol");
var StandardToken = artifacts.require("./token/StandardToken.sol");
var Ownable = artifacts.require("./ownership/Ownable.sol");
var Pausable = artifacts.require("./lifecycle/Pausable.sol");
var ParadiseToken = artifacts.require("./ParadiseToken.sol");
var ParadiseTokenSale = artifacts.require("./ParadiseTokenSale.sol");


module.exports = function(deployer, network, accounts) {
    //console.log("Accounts: " + accounts);
    
    deployer.deploy(SafeMath);
    deployer.deploy(Ownable);
    deployer.link(Ownable, Pausable);
    deployer.deploy(Pausable);

    deployer.deploy(BasicToken);
    deployer.link(BasicToken, SafeMath);
    deployer.link(BasicToken, ERC20Basic);

    deployer.deploy(StandardToken);
    deployer.link(StandardToken, BasicToken);

    deployer.deploy(ParadiseToken, userAddress);
    deployer.link(ParadiseToken, StandardToken);
    deployer.link(ParadiseToken, Ownable);
    deployer.link(ParadiseToken, SafeMath);

    var time = new Date().getTime() / 1000;

    var monkey = 1234;

    deployer.deploy(ParadiseToken, accounts[1]).then(function() {
        return deployer.deploy(ParadiseTokenSale, accounts[1], 10, 20, 1, time, 2, 15000, ParadiseToken.address);
    });

};
