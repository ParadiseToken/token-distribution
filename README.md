# Paradise Token Sale 
This document gives an overview of the smart contracts used for Paradise token and Crowdsales.

# Overview

## Paradise Token
The Paradise token smart contract `ParadiseToken.sol` is ERC20-compatible and has the following additional characteristics:

  1. A fixed supply of pre-minted tokens
  2. During the token sale period, regular users can transfer tokens
  3. A crowdsale is given an allowance of tokens to be sold on behalf of the token owner
  
During the token sale period, Paradise Token plans to do the following:

  1. Enable the ability to transfer tokens for everyone
  
###  Implementation

We use OpenZeppelin code for `SafeMath`, `Ownable` and `StandardToken` logic.

  * `SafeMath` provides arithmetic functions that throw exceptions when integer overflow occurs
  * `Ownable` keeps track of a contract owner and permits the transfer of ownership by the current owner
  * `StandardToken` provides an implementation of the basic standard token
  

The token contract includes the following constants:

    string public constant symbol = "PDT";
    string public constant name = "Paradise Token";
    uint8 public constant decimals = 18;
    uint256 public constant InitialSupplyCup = 300000000 * (10 ** uint256(decimals)); // 300 mil tokens minted
    uint256 public constant TokenAllowance = 210000000 * (10 ** uint256(decimals));   // 210 mil tokens public allowed 
    uint256 public constant AdminAllowance = InitialSupplyCup - TokenAllowance;       // 90 mil tokens admin allowed 
    
    
    
## Paradise Token Crowdsale

The Paradise Token crowdsale smart contract may be used to sell PDT tokens. To begin a crowdsale, the token owner must call the `enableTransfer()` function of the token contract, passing the address of the crowdsale contract and the requested allowance of tokens to be sold. Although ownership of the tokens is tied up in the token contract, the crowdsale is given an allowance of tokens from the crowdsale supply and thus is able to transfer tokens to users.

### Main Sale

On June, 2018 @ 5PM UTC and ending on July (or when sold old, whichever comes first), Paradise Token will have a maine sale for the PDT token. The conversion rate from PDT to ETH will change during the course of the maine sale according to the following schedule.

  * Week 1: `1 ETH = 30,000 PDT`
  * Week 2,3,4: `1 ETH = 15,000 PDT`
  
The `ParadiseTokenSale.sol` file contains the code for a crowdsale. The default fallback function is executed when payment is received. This function will calculate the number of tokens to be distributed to the contributor based on the conversion rate as specified above.


## Token Sale

This document will be updated with additional information regarding the main token sale for PDT.

Copyright 2018 Paradise Token. All Rights Reserved.










