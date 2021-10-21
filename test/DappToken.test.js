const DappToken = artifacts.require("DappToken");

contract('DappToken', (accounts) => {

    const adminAccount = accounts[0];
    let dappTokenInstance;

    beforeEach(async () => dappTokenInstance = await DappToken.deployed());

    describe('Initilizes the Contract Token', () => {

        it('Initializes the Token with the correct values', async () => {

            const name = 'DappToken';
            const symbol = 'DTK';

            const tokenName = await dappTokenInstance.name();
            assert.equal(name, tokenName, "The Token has the correct name");

            const tokenSymbol = await dappTokenInstance.symbol();
            assert.equal(symbol, tokenSymbol, "The Token has the correct symbol");

        });

        it('Sets the correct total supply upon deployment', async () => {

            const totalSupply = await dappTokenInstance.totalSupply();

            assert.equal(totalSupply, 1000000, "Sets the total supply to 1'000.000");
        });

        it('Sets the totalSupply to the admin address of the Token', async () => {


            const adminBalance = await dappTokenInstance.balanceOf(adminAccount);

            assert.equal(adminBalance, 1000000, "The admin balance is 1'000.000");
        });

    });

    describe('Transfer', () => {

        it('Should not transfer', async () => {

            try {
                const _to = accounts[1];
                const _value = 999999999;
                await dappTokenInstance.transfer.call(_to, _value);
                assert.fail();
            } catch (error) {
                assert(error.message.indexOf('rever') >= 0, "Error message contains a revert");
            }

        });

        it('Should transfer the correct value', async () => {

            const _to = accounts[Math.floor(Math.random() * accounts.length)];
            const _value = 250000;

            const returnValue = await dappTokenInstance.transfer.call(_to, _value); 
            const receipt = await dappTokenInstance.transfer(_to, _value, { from: adminAccount });

            const adminAccountBalance = await dappTokenInstance.balanceOf(adminAccount);
            const _toBalance = await dappTokenInstance.balanceOf(_to);
        
            assert.equal(adminAccountBalance.toNumber(), 750000, `It should be ${1000000 - _value}`);
            assert.equal(_toBalance, _value, `It should be ${_value}`);

            // Evento
            assert.equal(receipt.logs.length, 1, 'Emits just one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'Should be the "Transfer" event');
            assert.equal(receipt.logs[0].args._from, adminAccount, 'Logs the address where the tokens are transfered from');
            assert.equal(receipt.logs[0].args._to, _to, 'Logs the address where the tokens are transfered to');
            assert.equal(receipt.logs[0].args._value, _value, 'Logs the value transfered');

            // Return value
            assert.equal(returnValue, true, 'The method returns true');

        });

        it('Approves tokens for delegated transfer', async () => {

            // Random values
            const _randomSpender = accounts[Math.floor(Math.random() * accounts.length)];
            const _randomValue = Math.floor(Math.random() * 100);

            // Return value of the method
            const returnValue = await dappTokenInstance.approve.call(_randomSpender, _randomValue);
            assert.equal(returnValue, true, "The method returns true");

            // Execute the transaction
            const receipt = await dappTokenInstance.approve(_randomSpender, _randomValue, { from: adminAccount });

            // Event
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Approval', 'Should be the "Approval" event');
            assert.equal(receipt.logs[0].args._owner, adminAccount, 'Logs the address of the owner of the tokens');
            assert.equal(receipt.logs[0].args._spender, _randomSpender, 'Logs the address of the spender');
            assert.equal(receipt.logs[0].args._value, _randomValue, 'Logs the value approved');

            // Allowance
            const allowance = await dappTokenInstance.allowance(adminAccount, _randomSpender);
            assert.equal(allowance, _randomValue, 'Stores the allowance for delegated transfer')

        });

    });

});
