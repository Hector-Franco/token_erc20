const DappToken = artifacts.require("DappToken");
const DappTokenSale = artifacts.require("DappTokenSale");

module.exports = (deployer) => {
    const tokenPrice = 100000;
    deployer.deploy(DappToken, 1000000, "DappToken", "DTK");
    deployer.deploy(DappTokenSale, DappToken.address, tokenPrice);
};
