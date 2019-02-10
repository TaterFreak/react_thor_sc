const BasicContract = artifacts.require("./BasicContract.sol");

contract("BasicContract", accounts => {
  it("...should store the value 89.", async () => {
    const basicContractInstance = await BasicContract.deployed();

    // Set value of 89
    await basicContractInstance.set(89, { from: accounts[0] });

    // Get stored value
    const storedData = await basicContractInstance.get.call();

    assert.equal(storedData, 89, "The value 89 was not stored.");
  });
});
