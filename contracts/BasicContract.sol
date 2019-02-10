pragma solidity ^0.5.0;

contract BasicContract {
  uint storedData;

  function transfer(uint x) public {
    storedData = x;
  }

  function get() public view returns (uint) {
    return storedData;
  }
}
