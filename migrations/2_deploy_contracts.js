var Meter = artifacts.require("./Meter.sol");
module.exports = function(deployer) {
  deployer.deploy(Meter, {gas: 1000000});
};