// SPDX-License-Identifier: MIT
pragma solidity ^0.4.22;
// pragma solidity ^0.5.16;

contract DappToken {

    // Contract members
    string public name;
    string public symbol;
    uint256 public totalSupply;

    // Mappings (getters)
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    // Events
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

    // Constructor
    constructor(uint _initialSupply, string memory _name, string memory _symbol) public {

        // Sets the name
        name = _name;

        // Sets the symbol
        symbol =_symbol;

        // Sets the _initialSupply to totalSupply 
        totalSupply = _initialSupply;

        // Sets the totalSupply to the admin address
        balanceOf[msg.sender] = totalSupply;
    }

    // Transfer function
    function transfer(address _to, uint _value) public returns(bool success) {

        require(balanceOf[msg.sender] >= _value, "The balance must be greater than the _value");

        // Make the transfer

        // substract the _value of the sender balance
        balanceOf[msg.sender] -= _value;

        // adds the value to the reciever balance
        balanceOf[_to] += _value;

        // Emit the event
        emit Transfer(msg.sender, _to, _value);

        return true;
    }

    // Aprove function
    function approve(address _spender, uint256  _value) public returns(bool success) {

        //(tokenAdmin(msg.sender) approves _spender to spend _value tokens)
        allowance[msg.sender][_spender] = _value;

        // Emit the event
        emit Approval(msg.sender, _spender, _value);
        return true;

    }

}