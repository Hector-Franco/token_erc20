App = {

    // Proveedor de web3 
    web3Provider: null,
    // Contratos de la app
    contracts: {},
    // Account address
    account: '0x0',
    // Carga de todos los recursos
    loading: false,
    // Precio del token
    tokenPrice: 0,
    // Tokens vendidos
    tokenSold: 0,
    // Tokens disponibles
    tokenAvailable: 750000,

    // Inicializar app
    init: () => App.initWeb3(),

    // Inicializar Web3 
    initWeb3: () => {
        // Instancia de window.ethereum
        if (typeof window.ethereum !== 'undefined') {
            App.web3Provider = window.ethereum;
            web3 = new Web3(App.web3Provider);
        }
        // Instancia de web3 dada por Metamask 
        else if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentPrvider;
        }
        // Instancia del proveedor de Ganache
        else {
            App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
            web3 = new Web3(App.web3Provider);
        }

        return App.initContracts();
    },

    // Inicializar contratos
    initContracts: async () => {
        let dappTokenSaleInstance = await $.getJSON('DappTokenSale.json');
        App.contracts.DappTokenSale = TruffleContract(dappTokenSaleInstance);
        App.contracts.DappTokenSale.setProvider(App.web3Provider);

        let dappTokenInstance = await $.getJSON('DappToken.json');
        App.contracts.DappToken = TruffleContract(dappTokenInstance);
        App.contracts.DappToken.setProvider(App.web3Provider);

        return App.render();
    },

    render: async () => {

        if (App.loading)
            return;

        App.loading = true;
        let loader = $('#loader');
        let content = $('#content');

        loader.show();
        content.hide();

        try {

            // let BN = web3.utils.BN;
            App.account = await App.web3Provider.request({ method: 'eth_accounts' });
            $('#accountAddress').html('Your account: ' + App.account[0]);

            // Instancia del contrato DappTokenSale
            let dappTokenSaleInstance = await App.contracts.DappTokenSale.deployed();
            // Instancia del contrato DappTokenS
            let dappTokenInstance = await App.contracts.DappToken.deployed();

            let accountBalance = await dappTokenInstance.balanceOf(App.account);
            $('.dapp-balance').html(accountBalance.toNumber());

            App.tokenPrice = await dappTokenSaleInstance.tokenPrice();
            $('.token-price').html(web3.fromWei(App.tokenPrice, 'ether').toNumber());

            App.tokenSold = await dappTokenSaleInstance.tokensSold();
            $('.tokens-sold').html(App.tokenSold.toNumber());

            // App.tokenAvailable = await dappTokenSaleInstance.tokensSold(); 
            $('.tokens-available').html(App.tokenAvailable);

            let progressPercent = (App.tokenSold / App.tokenAvailable) * 100;
            console.log(progressPercent);
            $('#progress').css('width', progressPercent + '%');

            App.loading = false;
            loader.hide();
            content.show();

        } catch (error) {
            console.error(error);
        }
    },

    buyTokens: async () => {

        $('#content').hide();
        $('#loader').show();

        try {

            let numberOfTokens = $('#numberOfTokens').val();
            const value = numberOfTokens * App.tokenPrice;

            // Instancia del contrato DappTokenSale
            let dappTokenSaleInstance = await App.contracts.DappTokenSale.deployed();

            let receipt = await dappTokenSaleInstance.buyTokens(numberOfTokens,
                { from: App.account[0], gas: 500000, value }
            );

            if(receipt) {
                console.log('Tokens bought...');
                $('form').trigger('reset');
                $('#content').show();
                $('#loader').hide(); 
            }


        } catch (error) {
            console.error(error);
        }

    }
}


$(() => $(window).load(() => App.init()));
