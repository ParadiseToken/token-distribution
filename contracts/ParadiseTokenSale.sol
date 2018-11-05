pragma solidity ^0.4.21;

import './lifecycle/Pausable.sol';
import './math/SafeMath.sol';
import './ParadiseToken.sol';

/**
 * The ParadiseToken token (PDT) has a fixed supply and restricts the ability
 * to transfer tokens until the owner has called the enableTransfer()
 * function.
 *
 * The owner can associate the token with a token sale contract. In that
 * case, the token balance is moved to the token sale contract, which
 * in turn can transfer its tokens to contributors to the sale.
 */

contract ParadiseTokenSale is Pausable {

    using SafeMath for uint256;

    // The beneficiary is the future recipient of the funds
    address public beneficiary;

    // The crowdsale has a funding goal, cap, deadline, and minimum contribution
    uint public fundingGoal = 7300 ether;   // Base on 230$ per ether
    uint public fundingCap = 17000 ether;
    uint public minContribution = 10**17;  // 0.1 Ether
    bool public fundingGoalReached = false;
    bool public fundingCapReached = false;
    bool public saleClosed = false;

    // Time period of sale (UNIX timestamps)
    uint public startTime;
    uint public endTime;

    // Keeps track of the amount of wei raised
    uint public amountRaised;

    // The ratio of PDT to Ether
    uint public rate;
    uint public constant LOW_RANGE_RATE = 10000;    // 0% bonus
    uint public constant HIGH_RANGE_RATE = 14000;   // 40% bonus for 1 week
    
    // The token being sold
    ParadiseToken public tokenReward;

    // A map that tracks the amount of wei contributed by address
    mapping(address => uint256) public balanceOf;
    
    // Events
    event GoalReached(address _beneficiary, uint _amountRaised);
    event CapReached(address _beneficiary, uint _amountRaised);
    event FundTransfer(address _backer, uint _amount, bool _isContribution);

    // Modifiers
    modifier beforeDeadline()   { require (currentTime() < endTime); _; }
    modifier afterDeadline()    { require (currentTime() >= endTime); _; }
    modifier afterStartTime()    { require (currentTime() >= startTime); _; }

    modifier saleNotClosed()    { require (!saleClosed); _; }

    
    /**
     * Constructor for a crowdsale of ParadiseToken tokens.
     *
     * @param ifSuccessfulSendTo            the beneficiary of the fund
     * @param fundingGoalInEthers           the minimum goal to be reached
     * @param fundingCapInEthers            the cap (maximum) size of the fund
     * @param minimumContributionInWei      minimum contribution (in wei)
     * @param start                         the start time (UNIX timestamp)
     * @param durationInMinutes             the duration of the crowdsale in minutes
     * @param ratePDTToEther                the conversion rate from PDT to Ether
     * @param addressOfTokenUsedAsReward    address of the token being sold
     */
    constructor(
        address ifSuccessfulSendTo,
        uint fundingGoalInEthers,
        uint fundingCapInEthers,
        uint minimumContributionInWei,
        uint start,
        uint durationInMinutes,
        uint ratePDTToEther,
        address addressOfTokenUsedAsReward
    ) public {
        require(ifSuccessfulSendTo != address(0) && ifSuccessfulSendTo != address(this));
        require(addressOfTokenUsedAsReward != address(0) && addressOfTokenUsedAsReward != address(this));
        require(fundingGoalInEthers <= fundingCapInEthers);
        require(durationInMinutes > 0);
        beneficiary = ifSuccessfulSendTo;
        fundingGoal = fundingGoalInEthers * 1 ether;
        fundingCap = fundingCapInEthers * 1 ether;
        minContribution = minimumContributionInWei;
        startTime = start;
        endTime = start + durationInMinutes * 1 minutes; 
        setRate(ratePDTToEther);
        tokenReward = ParadiseToken(addressOfTokenUsedAsReward);
    }

    /**
     * This function is called whenever Ether is sent to the
     * smart contract. It can only be executed when the crowdsale is
     * not paused, not closed, and before the deadline has been reached.
     *
     * This function will update state variables for whether or not the
     * funding goal or cap have been reached. It also ensures that the
     * tokens are transferred to the sender, and that the correct
     * number of tokens are sent according to the current rate.
     */
    function () payable public  {
        buy();
    }

    function buy ()
        payable public
        whenNotPaused
        beforeDeadline
        afterStartTime
        saleNotClosed
    {
        require(msg.value >= minContribution);
        uint amount = msg.value;
        
        // Compute the number of tokens to be rewarded to the sender
        // Note: it's important for this calculation that both wei
        // and PDT have the same number of decimal places (18)
        uint numTokens = amount.mul(rate);
        
        // Transfer the tokens from the crowdsale supply to the sender
        if (tokenReward.transferFrom(tokenReward.owner(), msg.sender, numTokens)) {
    
        // update the total amount raised
        amountRaised = amountRaised.add(amount);
     
        // update the sender's balance of wei contributed
        balanceOf[msg.sender] = balanceOf[msg.sender].add(amount);

        emit FundTransfer(msg.sender, amount, true);
        // Check if the funding goal or cap have been reached
        checkFundingGoal();
        checkFundingCap();
        }
        else {
            revert();
        }
    }
    
    /**
     * The owner can update the rate (PDT to ETH).
     *
     * @param _rate  the new rate for converting PDT to ETH
     */
    function setRate(uint _rate) public onlyOwner {
        require(_rate >= LOW_RANGE_RATE && _rate <= HIGH_RANGE_RATE);
        rate = _rate;
    }
    
     /**
     * The owner can terminate the crowdsale at any time.
     */
    function terminate() external onlyOwner {
        saleClosed = true;
    }
    
     /**
     *
     * The owner can allocate the specified amount of tokens from the
     * crowdsale allowance to the recipient (to).
     *
     * NOTE: be extremely careful to get the amounts correct, which
     * are in units of wei and PDT. Every digit counts.
     *
     * @param to            the recipient of the tokens
     * @param amountWei     the amount contributed in wei
     * @param amountPDT the amount of tokens transferred in PDT
     */
     
     
     function ownerAllocateTokens(address to, uint amountWei, uint amountPDT) public
            onlyOwner 
    {
        //don't allocate tokens for the admin
        //require(tokenReward.adminAddr() != to);
        
        if (!tokenReward.transferFrom(tokenReward.owner(), to, amountPDT)) {
            revert();
        }
        amountRaised = amountRaised.add(amountWei);
        balanceOf[to] = balanceOf[to].add(amountWei);
        emit FundTransfer(to, amountWei, true);
        checkFundingGoal();
        checkFundingCap();
    }

    /**
     * The owner can call this function to withdraw the funds that
     * have been sent to this contract. The funds will be sent to
     * the beneficiary specified when the crowdsale was created.
     */
    function ownerSafeWithdrawal() external onlyOwner  {
        uint balanceToSend = address(this).balance;
        beneficiary.transfer(balanceToSend);
        emit FundTransfer(beneficiary, balanceToSend, false);
    }
    
   /**
     * Checks if the funding goal has been reached. If it has, then
     * the GoalReached event is triggered.
     */
    function checkFundingGoal() internal {
        if (!fundingGoalReached) {
            if (amountRaised >= fundingGoal) {
                fundingGoalReached = true;
                emit GoalReached(beneficiary, amountRaised);
            }
        }
    }

    /**
     * Checks if the funding cap has been reached. If it has, then
     * the CapReached event is triggered.
     */
   function checkFundingCap() internal {
        if (!fundingCapReached) {
            if (amountRaised >= fundingCap) {
                fundingCapReached = true;
                saleClosed = true;
                emit CapReached(beneficiary, amountRaised);
            }
        }
    }

    /**
     * Returns the current time.
     * Useful to abstract calls to "now" for tests.
    */
    function currentTime() constant public returns (uint _currentTime) {
        return now;
    }
}
