var BasicContract = artifacts.require("./BasicContract.sol");
var Bet = artifacts.require("./Bet.sol");

module.exports = function(deployer) {
  deployer.deploy(Bet);
};
