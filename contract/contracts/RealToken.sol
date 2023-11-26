// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract RealToken is ERC20 , Ownable{

  uint256 private  _totalSupply=100000000000000000000000000;
  constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol){     
    _mint(msg.sender, _totalSupply);
    
  }
}