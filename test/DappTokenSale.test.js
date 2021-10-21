const DappToken = artifacts.require("DappToken");
const DappTokenSale = artifacts.require("DappTokenSale");

contract('DappTokenSale', (accounts) => {

    let dappTokenSaleInstance;
    let dappTokenInstance;

    const adminAccount = accounts[0];
    // const tokensAvailable = Math.floor(1000000 * Math.random()); // 260.000
    const tokensAvailable = 750000; // 750.000
    const tokenPrice = 100000; // 10'000.000

    const buyer = accounts[2];

    beforeEach(async () => {
        dappTokenSaleInstance = await DappTokenSale.deployed();
        dappTokenInstance = await DappToken.deployed();
    });

    describe('Initilizes the Contract Token Sale', () => {

        it('Initializes de contract with the correct values', async () => {
            const contractAddress = await dappTokenSaleInstance.address;
            assert.notEqual(contractAddress, 0x0, 'The contract has a valid address');

            const tokenContractAddress = await dappTokenSaleInstance.tokenContract();
            assert.notEqual(tokenContractAddress, 0x0, 'The contract has a valid token address');

            const price = await dappTokenSaleInstance.tokenPrice();
            assert.equal(price, tokenPrice, 'Token price is correct');
        });
    });

    describe('Buying Tokens', () => {

        const numberOfTokens = 1;
        const value = numberOfTokens * tokenPrice;

        it('Should allow to buy tokens', async () => {

            let balanceSale = await dappTokenInstance.balanceOf(dappTokenSaleInstance.address);
            console.log('Sale Balance A:', balanceSale.toNumber());

            // Asignar tokens disponibles primero
            await dappTokenInstance.transfer(dappTokenSaleInstance.address, tokensAvailable, { from: adminAccount });

            balanceSale = await dappTokenInstance.balanceOf(dappTokenSaleInstance.address);
            console.log('Sale Balance D:', balanceSale.toNumber());

            // Comprar tokens desde la cuenta Buyer
            const receipt = await dappTokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value });

            const amount = await dappTokenSaleInstance.tokensSold();
            assert.equal(amount.toNumber(), numberOfTokens, 'Increments the number of tokens sold');

            assert.equal(receipt.logs.length, 1, 'Emits just one event');
            assert.equal(receipt.logs[0].event, 'Sell', 'Should be the "Sell" event');
            assert.equal(receipt.logs[0].args._buyer, buyer, 'Logs the address of the buyer tokens');
            assert.equal(receipt.logs[0].args._numberOfTokens, numberOfTokens, 'Logs the amount of tokens bougth');
        });

        it('Should NOT allow to buy tokens', async () => {
            try {
                await dappTokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: 1 });
                assert.fail();
            } catch (error) {
                assert(error.message.indexOf('revert') >= 0, "msg.value must equal number in wei");
            }
        });

        it('Should NOT allow to buy more tokens than the balance', async () => {

            try {
                const wrongNumberOfTokens = 1000000;
                await dappTokenSaleInstance.buyTokens(wrongNumberOfTokens, { from: buyer, value: wrongNumberOfTokens * tokenPrice });
                assert.fail();
            } catch (error) {
                assert(error.message.indexOf('revert') >= 0, "Cannot purchase more tokens than the available");
            }
        });
    });

    describe('Ends Tokens Sale', () => {
        it('Should not end the contract from other account', async () => {
            try {
                await dappTokenSaleInstance.endSale({ from: buyer });
                assert.fail();
            } catch (error) {
                assert(error.message.indexOf('revert') >= 0, 'Must be admin to end');
            }
        });

        it('Should let the admin end the sale', async () => {

            const receipt = await dappTokenSaleInstance.endSale({ from: adminAccount });

            const adminBalance = await dappTokenInstance.balanceOf(adminAccount);
            // const tokenSupply = await dappTokenInstance.totalSupply();
            assert.equal(adminBalance.toNumber(), 250000, 'returns the remaining tokens to the admin')

        });
    });
});