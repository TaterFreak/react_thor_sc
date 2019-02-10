pragma solidity ^0.5.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/BasicContract.sol";

contract TestSimpleStorage {

  function testItStoresAValue() public {
    BasicContract basicContract = BasicContract(DeployedAddresses.BasicContract());

    basicContract.set(89);

    uint expected = 89;

    Assert.equal(basicContract.get(), expected, "It should store the value 89.");
  }

}
