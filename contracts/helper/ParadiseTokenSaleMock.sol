pragma solidity ^0.4.21;

import '../ParadiseTokenSale.sol';

/**
 * The ParadiseToken token (PDT) has a fixed supply and restricts the ability
 * to transfer tokens until the owner has called the enableTransfer()
 * function.
 *
 * The owner can associate the token with a token sale contract. In that
 * case, the token balance is moved to the token sale contract, which
 * in turn can transfer its tokens to contributors to the sale.
 */
 
 contract ParadiseTokenSaleMock is ParadiseTokenSale {
 
 uint public _now;
 
 constructor(
        address ifSuccessfulSendTo,
        uint fundingGoalInEthers,
        uint fundingCapInEthers,
        uint minimumContributionInWei,
        uint start,
        uint durationInMinutes,
        uint ratePDTToEther,
        address addressOfTokenUsedAsReward
    ) public ParadiseTokenSale(ifSuccessfulSendTo, fundingGoalInEthers, fundingCapInEthers,
                     minimumContributionInWei, start, durationInMinutes, ratePDTToEther,
                     addressOfTokenUsedAsReward){ 
        _now = start + 1;
    }

    function currentTime() view public returns (uint) {
        return _now;
    }

    event HitLine(uint key, uint val);
    function changeTime(uint _newTime) onlyOwner external {
        emit HitLine(123, _newTime);
        _now = _newTime;
    }
}
