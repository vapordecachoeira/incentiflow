var Meter = artifacts.require("./Meter.sol");
var Sponsorship = artifacts.require("./Sponsorship.sol");
module.exports = function (deployer) {
    deployer.deploy(Meter, {gas: 1000000});
    deployer.deploy(Sponsorship, {gas: 1000000});
};