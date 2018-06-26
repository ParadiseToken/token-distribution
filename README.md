# token-distribution
Token and crowd sale smart contracts
Paradise Token Token Sale
This document gives an overview of the smart contracts used for Paradise token and Crowdsales.

Overview
Paradise Token

The Paradise token smart contract ParadiseToken.sol is ERC20-compatible and has the following additional characteristics:

A fixed supply of pre-minted tokens
During the token sale period, regular users can transfer tokens
A crowdsale is given an allowance of tokens to be sold on behalf of the token owner
During the token sale period, Paradise Token plans to do the following:

Enable the ability to transfer tokens for everyone
Implementation
We use OpenZeppelin code for SafeMath, Ownable and StandardToken logic.

Token and crowd sale smart contracts
