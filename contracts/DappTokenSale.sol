// SPDX-License-Identifier: MIT
pragma solidity ^0.4.22;
// pragma solidity ^0.5.16;

import "./DappToken.sol";

contract DappTokenSale {
    DappToken public tokenContract;
    address admin;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    // Events
    event Sell(address _buyer, uint256 _numberOfTokens);

    // error InsufficientBalance(uint _tokens, uint _disponible);

    constructor(DappToken _tokenContract, uint256 _tokenPrice) public {
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }

    // Buy Tokens
    function buyTokens(uint256 _numberOfTokens) public payable {
        // Require the value is equal to tokens
        require(msg.value == multiply(_numberOfTokens, tokenPrice));
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
        require(tokenContract.transfer(msg.sender, _numberOfTokens));

        // Tracks the tokens sold
        tokensSold += _numberOfTokens;

        // Triggers the Sell event
        emit Sell(msg.sender, _numberOfTokens);
    }

    function endSale() public payable {
        // Require admin
        require(msg.sender == admin);
        // Transfer remaining Dapp tokens to admin
        require(
            tokenContract.transfer(
                admin,
                tokenContract.balanceOf(address(this))
            )
        );
        // Destroy contract
        // selfdestruct(address(admin));

        // UPDATE: Let's not destroy the contract here
        // Just transfer the balance to the admin
        admin.transfer(address(this).balance);
    }

    function multiply(uint256 _a, uint256 _b)
        internal
        pure
        returns (uint256 _c)
    {
        require(_b == 0 || (_c = _a * _b) / _b == _a);
    }
}
