var _ = require("lodash");
var request = require("request-promise");
var util 	= require('../util');
var fs = require('fs');
var path = require('path');
const etherscanToken = JSON.parse(fs.readFileSync(path.basename('keys.json'))).etherscanToken;
const contractAddress = '0x13f11c9905a08ca76e3e853be63d4f0944326c72';
const etherscanApiUrl = 'https://api.etherscan.io/api'
// https://etherchain.org/account/0x13f11c9905a08ca76e3e853be63d4f0944326c72#txsent

const getEtherPrice = function (channel) {
  const ethereumDivider = 1000000000000000000;
  const etherPriceOptions = {
    uri: etherscanApiUrl,
    qs: {
      apikey: etherscanToken,
      module: 'stats',
      action: 'ethprice'
    },
    headers: {
      'User-Agent': 'Request-Promise'
    }
  }
  const addressBalance = {
    uri: etherscanApiUrl,
    qs: {
      apikey: etherscanToken,
      module: 'account',
      action: 'balance',
      address: contractAddress,
      tag: 'latest'
    },
    headers: {
      'User-Agent': 'Request-Promise'
    }
  }
  const normalTransactions = {
    uri: etherscanApiUrl,
    qs: {
      apikey: etherscanToken,
      module: 'account',
      action: 'txlist',
      startblock: 0,
      endblock: 999999999,
      sort: 'asc',
      address: contractAddress
    },
    headers: {
      'User-Agent': 'Request-Promise'
    }
  }
  const internalTransactions = {
    uri: etherscanApiUrl,
    qs: {
      module: 'account',
      action: 'txlistinternal',
      startblock: 0,
      endblock: 999999999,
      sort: 'asc',
      address: contractAddress,
      apikey: etherscanToken
    },
    headers: {
      'User-Agent': 'Request-Promise'
    }
  }

  Promise.all(
      [
       request(etherPriceOptions),
       request(addressBalance),
       request(internalTransactions),
       request(normalTransactions)
      ]
  )
  .then( res => {
      const prices = JSON.parse(res[0]).result;
      const internalTransactions = JSON.parse(res[2]).result;
      const normalTransactions = JSON.parse(res[3]).result;
      const walletBalanceEth = _.round(JSON.parse(res[1]).result/ethereumDivider, 2);
      const ethUsd = _.round(prices.ethusd, 2);
      const walletBalanceUsd = _.round(walletBalanceEth * ethUsd,2)
      const outTransactions = _.filter(internalTransactions, {'from': contractAddress});
      const inTransactions = _.filter(normalTransactions, {'to': contractAddress});
      const sumOutTransactionsEth = _.sumBy(outTransactions, outTransaction => outTransaction.value/ethereumDivider)
      const sumInTransactionsEth = _.sumBy(inTransactions, inTransaction => inTransaction.value/ethereumDivider)
      const sumOutTransactionsDollars = _.round(sumOutTransactionsEth * ethUsd, 2);
      const sumInTrasactionsDollars = _.round(sumInTransactionsEth * ethUsd, 2);
      const totalWalletEth = _.round(sumOutTransactionsEth + walletBalanceEth, 2);
      const totalWalletUsd = _.round(totalWalletEth * ethUsd, 2);
      const totalTransactionsIn = inTransactions.length;
      const totalTransactionsOut = outTransactions.length
      const message = `
The current total raised is:
    ${totalWalletEth} Ether
    $${totalWalletUsd}
The current wallet holds:
    ${walletBalanceEth} Ether
    $${walletBalanceUsd}
There has been:
    ${totalTransactionsOut} transactions out
    ${totalTransactionsIn + 1} transactions in
The current ethereum price from etherscan is:
    ${ethUsd} ETH/USD`
      util.postMessage(channel, message, true);
    }
  )
  .catch(err => {console.log(`error:${err}`)})
}
module.exports = function (param) {
  const channel = param.channel;
  getEtherPrice(channel);
}
