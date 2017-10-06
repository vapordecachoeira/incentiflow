import "../stylesheets/app.css";
import {default as Web3} from "web3";
import {default as contract} from "truffle-contract";
// Import our contract artifacts and turn them into usable abstractions.
import meter_artifacts from "../../build/contracts/Meter.json";

var Meter = contract(meter_artifacts);

var accounts;
var account;

window.App = {
    start: function () {
        var self = this;
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
            // self.refreshBalance();
        });

        Meter.deployed().then(function (contract) {
            var updates = contract.Updated({fromBlock: "latest"});
            updates.watch(function (err, response) {
                if (error == null) {
                    console.log(result.args);
                }
                self.setStatus('Measurement updated for device ' + response.args._from + ': ' + response.args._measurement.toNumber());
            });
        });
    },

    setStatus: function (message) {
        var status = document.getElementById('status');
        status.innerHTML = message;
    },

    getSerial: function () {
        var self = this;
        let device_address = $('#device_address').val();
        Meter.deployed().then(function (instance) {
            return instance.get_serial.call(device_address, {from: account});
        }).then(function (value) {
            self.setStatus('Serial: ' + value);
        }).catch(function (e) {
            console.log(e);
            self.setStatus('Error getting serial. Check the console.');
        });
    },

    updateCount: function () {
        var self = this;
        let device_address = $('#device_address').val();
        let count = $('#count').val();
        Meter.deployed().then(function (instance) {
            return instance.update(count, {from: account, gas: 210000});
        }).then(function (result) {
            $('#td-count-' + account).html(count.toString());
        }).catch(function (e) {
            console.log(e);
            self.setStatus('Error getting device count. Check the console.');
        });
    },

    getCount: function (device_address) {
        var self = this;
        Meter.deployed().then(function (instance) {
            return instance.get_count.call(device_address, {from: account});
        }).then(function (count) {
            $('#td-count-' + device_address).html(count.toString());
        }).catch(function (e) {
            console.log(e);
            self.setStatus('Error getting device count. Check the console.');
        });
    },

    register: function () {
        var self = this;
        var device_address = $('#device_address').val();
        let serial = $('#serial').val();
        let created_at_unix_time_gmt = Date.now() / 1000;
        Meter.deployed().then(function (instance) {
            return instance.register(device_address, serial, created_at_unix_time_gmt, {
                gas: 210000,
                from: account
            });
        }).then(function (result) {
            self.setStatus('Registered!');
            let date_str = new Date(created_at_unix_time_gmt);
            $("<tr><td class='row_device_address'>" + device_address + "</td><td>" + serial + "</td><td id='td-count-" + device_address + "'> - </td><td>" + date_str + "</td></tr>").appendTo("#devicesTable tbody");
            self.getCount(device_address);
        }).catch(function (e) {
            console.log(e);
            self.setStatus('Error registering. Check the console.');
        });
    },

    loopRefreshCounters: function () {
        var self = this;
        $( ".row_device_address" ).each(function( index ) {
            console.log( index + ": " + $( this ).text() );
            self.App.getCount($( this ).text());
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
    setInterval(App.loopRefreshCounters, 1000);

});
