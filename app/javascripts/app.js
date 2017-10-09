import "../stylesheets/app.css";
import {default as Web3} from "web3";
import {default as contract} from "truffle-contract";
// Import our contract artifacts and turn them into usable abstractions.
import meter_artifacts from "../../build/contracts/Meter.json";
import sponsorship_artifacts from "../../build/contracts/Sponsorship.json";

var Meter = contract(meter_artifacts);
var Sponsorship = contract(sponsorship_artifacts);

var accounts;
var account;
// var NETWORK = "Rinkeby";
// var METER_CONTRACT_ADDRESS = "0xCe213940F782df68349546Ab120f5c286A13551C";

var NETWORK = "Testrpc";
var METER_CONTRACT_ADDRESS = "0x0018fb4deb095b2f4a1843d29524e6327c06072c";
var SPONSORSHIP_CONTRACT_ADDRESS = "0x7dea004855fd92e0445d1dd0da2df3b5f7ff0976";


// Workaround to get account balances
const promisify = (inner) =>
    new Promise((resolve, reject) =>
        inner((err, res) => {
            if (err) { reject(err) }
            resolve(res);
        })
    );

const getBalance = (account, at) =>
    promisify(cb => web3.eth.getBalance(account, at, cb));


window.App = {
    start: function () {
        var self = this;
        Sponsorship.setProvider(web3.currentProvider);
        Meter.setProvider(web3.currentProvider);

        web3.eth.getAccounts(function (err, accs) {
            if (err != null) {
                alert("There was an error fetching your accounts.");
                return;
            }
            if (accs.length == 0) {
                alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
                return;
            }
            accounts = accs;
            account = accounts[0];

            self.visitor_address = web3.eth.coinbase;
            $('#my_account_address').val(self.visitor_address);
        });




        // Initialize Meter
        self.meter = Meter.at(METER_CONTRACT_ADDRESS);
        self.setStatus('Using Meter contract at: ' + NETWORK + ' - ' + METER_CONTRACT_ADDRESS);
        self.meter.then(function (contract) {
            var updates = contract.Updated({fromBlock: "latest"});
            updates.watch(function (err, response) {
                if (error == null) {
                    console.log(result.args);
                }
                self.setStatus('Measurement updated for device ' + response.args._from + ': ' + response.args._measurement.toNumber());
            });
        });
        this.checkRegistrationAccess();

        //Initialize Sponsoship Contract
        self.sponsorship = Sponsorship.at(SPONSORSHIP_CONTRACT_ADDRESS);
        self.setStatus('Initializing sponsorship contract at: ' + NETWORK + ' - ' + SPONSORSHIP_CONTRACT_ADDRESS);
    },

    checkRegistrationAccess: function (message) {
        var self = this;
        self.meter.owner.call().then((contract_owner) => {
            if (self.visitor_address != contract_owner) {
                $('#btn_register').prop('disabled', true);
                $('#serial').prop('disabled', true);
                $('#td_serial').html("<small>Sorry, only the contract owner can register devices. You can, although, watch any registered device.</small>");
            }
        });
    },

    setStatus: function (message) {
        var status = document.getElementById('status');
        status.innerHTML = message;
    },

    getSerial: function () {
        var self = this;
        let device_address = $('#device_address').val();
        self.meter.then(function (instance) {
            return instance.getSerial.call(device_address, {from: account});
        }).then(function (serial) {
            $('#td-serial-' + device_address).html(serial.toString());
        }).catch(function (e) {
            console.log(e);
            self.setStatus('Error getting serial. Check the console.');
        });
    },

    getCount: function (device_address) {
        var self = this;
        self.meter.then(function (instance) {
            return instance.getCount.call(device_address, {from: account});
        }).then(function (count) {
            $('#td-count-' + device_address).html(count.toString());
        }).catch(function (e) {
            console.log(e);
            self.setStatus('Error getting device count. Check the console.');
        });
    },

    getBalance: function (device_address) {
        var self = this;
        getBalance(device_address).then(function (balance) {
            $('#td-balance-' + device_address).html(balance.toString());
        }).catch(function (e) {
            console.log(e);
            self.setStatus('Error getting device balance. Check the console.');
        });
    },

    getCreatedAt: function (device_address) {
        var self = this;
        self.meter.then(function (instance) {
            return instance.getCreatedAt.call(device_address, {from: account});
        }).then(function (created_at) {
            var date = new Date(created_at.toNumber());
            var date_str = (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear()
            $('#td-created_at-' + device_address).html(date_str);
        }).catch(function (e) {
            console.log(e);
            self.setStatus('Error getting device created at data. Check the console.');
        });
    },

    register: function () {
        var self = this;
        var device_address = $('#device_address').val();
        let serial = $('#serial').val();
        let created_at_unix_time_gmt = Date.now() / 1000;
        self.meter.then(function (instance) {
            return instance.register(device_address, serial, created_at_unix_time_gmt, {
                gas: 210000,
                from: account
            });
        }).then(function (result) {
            self.watch();
        }).catch(function (e) {
            console.log(e);
            self.setStatus('Error registering. Check the console.');
        });
    },


    sponsorship_deposit: function() {
        var self = this;
        var amount = $('#my_deposit').val();
        var amount_in_wei = web3.toWei(amount, 'ether');
        self.sponsorship.then(function (instance) {
            return instance.deposit({
                gas: 210000,
                from: account,
                value: amount_in_wei
            });
        }).then(function (result) {
            self.setStatus('Deposit successful.');
        }).catch(function (e) {
            console.log(e);
            self.setStatus('Error depositing. Check the console.');
        });
    },

    sponsor: function() {
        var self = this;
        var sponsored = $('#my_sponsored_address').val();
        var wei_per_unit = $('#wei_per_unit').val();
        self.sponsorship.then(function (instance) {
            return instance.sponsor(sponsored, wei_per_unit, {
                gas: 210000,
                from: account
            });
        }).then(function (result) {
            self.setStatus('Sponsoring device: ' + sponsored + ' paying ' + wei_per_unit + ' weis per counter unit used.');
        }).catch(function (e) {
            console.log(e);
            self.setStatus('Error depositing. Check the console.');
        });
    },

    watch: function () {
        var addr = $('#device_address').val();
        this.addRow(addr);

        this.getCount(addr);
        this.getSerial(addr);
        this.getBalance(addr);
        this.getCreatedAt(addr);
''
        this.watchSponsored();
    },

    addRow: function (addr, prefix='') {
        $("<tr><td class='td-device_address-'>" + prefix + ' ' + addr + "</td><td id='td-serial-" + addr + "'> - " +
            "</td><td id='td-count-" + addr + "'> - </td><td id='td-balance-" + addr + "'> - </td>" +
            "<td id='td-created_at-" + addr + "'> - </td></tr>").appendTo("#devicesTable tbody");
    },

    watchSponsored: function() {
        var self = this;
        self.sponsorship.getSponsored.call().then((sponsored) => {
            self.addRow(sponsored, 'SPONSORED - ');
            self.getCount(sponsored);
            self.getSerial(sponsored);
            self.getBalance(sponsored);
            self.getCreatedAt(sponsored);
        }).catch(function (e) {
            console.log(e);
        });
    },

    updateCount: function () {
        var self = this;
        let device_address = $('#device_address').val();
        let count = $('#count').val();
        self.meter.then(function (instance) {
            return instance.update(count, {from: account, gas: 210000});
        }).then(function (result) {
            $('#td-count-' + account).html(count.toString());

            for (var i = 0; i < result.logs.length; i++) {
                var log = result.logs[i];
                if (log.event == 'Updated') {
                    self.sponsorship_execute(log.args['_increase'].toNumber());
                    break;
                }
            }

        }).catch(function (e) {
            console.log(e);
            self.setStatus('Error getting device count. Check the console.');
        });
    },

    sponsorship_execute: function(count_increase) {
        var self = this;
        self.sponsorship.then(function (instance) {
            return instance.execute(count_increase, {
                gas: 410000,
                from: account
            });
        }).catch(function (e) {
            console.log(e);
            self.setStatus('Error executing sponsorship. Check the console.');
        });
    },

    loopRefreshCounters: function () {
        var self = this;
        $('.td-device_address-').each(function (index) {
            self.App.getCount($(this).text());
        });
    }
};

window.addEventListener('load', function () {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        App.setStatus("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
        // Use Mist/MetaMask's provider
        window.web3 = new Web3(web3.currentProvider);
    } else {
        App.setStatus("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }
    App.start();
    // setInterval(App.loopRefreshCounters, 2000);

});
