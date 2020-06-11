let PecasProcessuais = artifacts.require("./PecasProcessuais.sol");

module.exports = function(deployer) {
  deployer.deploy(PecasProcessuais);
};
