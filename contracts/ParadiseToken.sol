pragma solidity ^0.4.21;

import './token/StandardToken.sol';
import './ownership/Ownable.sol';
import './math/SafeMath.sol';

/*
 * ParadiseToken is a standard ERC20 token with some additional functionalities:
 * - Transfers are only enabled after contract owner enables it (After StartTime)
 * - Contract sets 70% of the total supply as allowance for ICO contract
 */
    
contract ParadiseToken is StandardToken, Ownable {
    
    // Constants
    string public constant symbol = "PDT";
    string public constant name = "Paradise Token";
    uint8 public constant decimals = 18;
    uint256 public constant InitialSupplyCup = 300000000 * (10 ** uint256(decimals)); // 300 mil tokens minted
    uint256 public constant TokenAllowance = 210000000 * (10 ** uint256(decimals));   // 210 mil tokens public allowed 
    uint256 public constant AdminAllowance = InitialSupplyCup - TokenAllowance;       // 90 mil tokens admin allowed 
    
    // Properties
    address public adminAddr;              // the number of tokens available for the administrator
    address public tokenAllowanceAddr;     // the number of tokens available for crowdsales
    bool public transferEnabled = false;   // indicates if transferring tokens is enabled or not
    
    
    modifier onlyWhenTransferAllowed() {
        require(transferEnabled || msg.sender == adminAddr || msg.sender == tokenAllowanceAddr);
        _;
    }

    /**
     * Check if token offering address is set or not
     */
    modifier onlyTokenOfferingAddrNotSet() {
        require(tokenAllowanceAddr == address(0x0));
        _;
    }

    /**
     * Check if address is a valid destination to transfer tokens to
     * - must not be zero address
     * - must not be the token address
     * - must not be the owner's address
     * - must not be the admin's address
     * - must not be the token offering contract address
     */
    modifier validDestination(address to) {
        require(to != address(0x0));
        require(to != address(this));
        require(to != owner);
        require(to != address(adminAddr));
        require(to != address(tokenAllowanceAddr));
        _;
    }
    
    /**
     * Token contract constructor
     *
     * @param admin Address of admin account
     */
    constructor(address admin) public {
        totalSupply = InitialSupplyCup;
        
        // Mint tokens
        balances[msg.sender] = totalSupply;
        emit Transfer(address(0x0), msg.sender, totalSupply);

        // Approve allowance for admin account
        adminAddr = admin;
        approve(adminAddr, AdminAllowance);
    }

    /**
     * Set token offering to approve allowance for offering contract to distribute tokens
     *
     * Note that if _amountForSale is 0, then it is assumed that the full
     * remaining crowdsale supply is made available to the crowdsale.
     * 
     * @param offeringAddr Address of token offerng contract
     * @param amountForSale Amount of tokens for sale, set 0 to max out
     */
    function setTokenOffering(address offeringAddr, uint256 amountForSale) external onlyOwner {
        require(!transferEnabled);

        uint256 amount = (amountForSale == 0) ? TokenAllowance : amountForSale;
        require(amount <= TokenAllowance);

        approve(offeringAddr, amount);
        tokenAllowanceAddr = offeringAddr;
        
    }
    
    /**
     * Enable transfers
     */
    function enableTransfer() external onlyOwner {
        transferEnabled = true;

        // End the offering
        approve(tokenAllowanceAddr, 0);
    }

    /**
     * Transfer from sender to another account
     *
     * @param to Destination address
     * @param value Amount of PDTtokens to send
     */
    function transfer(address to, uint256 value) public onlyWhenTransferAllowed validDestination(to) returns (bool) {
        return super.transfer(to, value);
    }
    
    /**
     * Transfer from `from` account to `to` account using allowance in `from` account to the sender
     *
     * @param from Origin address
     * @param to Destination address
     * @param value Amount of PDTtokens to send
     */
    function transferFrom(address from, address to, uint256 value) public onlyWhenTransferAllowed validDestination(to) returns (bool) {
        return super.transferFrom(from, to, value);
    }
    
}
