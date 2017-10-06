# truffle-init-webpack
Example webpack project with Truffle. Includes contracts, migrations, tests, user interface and webpack build pipeline.

## Building and the frontend

1. First run `truffle compile`, then run `truffle migrate` to deploy the contracts onto your network of choice (default "development").
1. Then run `npm run dev` to build the app and serve it on http://localhost:8080

## Possible upgrades

* Use the webpack hotloader to sense when contracts or javascript have been recompiled and rebuild the application. Contributions welcome!

## Common Errors

* **Error: Can't resolve '../build/contracts/Meter.json'**

This means you haven't compiled or migrated your contracts yet. Run `truffle compile` and `truffle migrate` first.

## Usage

This means you haven't compiled or migrated your contracts yet. Run `truffle compile` and `truffle migrate` first.

1. Start your local testrpc
2. Run the compile and migrate
3. Open the web page and register the device address and serial number
4. Once your device start pushing, the counter will be updated automatically

Note 1: At the moment I'm not persisting the addresses anywhere. I know, it's pretty annoying, but if you need to load 
it again just boot the testrpc and add the device address again.

Note 2: If you want to test without the Pi, you can unlock an account from the truffle console and issue something on
these lines:

```
Meter.deployed().then(function(instance){ instance.update(132, {from: web3.eth.accounts[ XXXX ], gas: 210000})})
```
