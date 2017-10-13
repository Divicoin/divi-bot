var _ = require("lodash");
var cheerio = require("cheerio");
var request = require("request");
var util 	= require('../util');
var info = "";
var result = [];
var scrapeEtherscanForCurrentTotal = (totalSent, callBack, channel) => {
  request("https://etherscan.io/address/0x13f11c9905a08ca76e3e853be63d4f0944326c72", function (error, response, html) {

    var $ = cheerio.load(html);
    var re = /\d*\.\d*/;
    var currentWallet;
    var totalRaised;


    $("#ContentPlaceHolder1_divSummary div table tbody tr td:nth-child(2)").each(function (i, element) {
      result.push($(element).text());
      console.log('result', result);
    });

    currentWallet = _.round(re.exec(result[0]), 2);
    totalRaised = currentWallet + totalSent;


    request('https://api.etherscan.io/api?module=stats&action=ethprice&apikey=7NU4FJ7QBV34YA8A662KRBZPHRCBETVNPMA', (err, res, body) => {
      var ethusd = JSON.parse(res.body).result.ethusd;
      var totalRaisedUsd = _.round((totalRaised* ethusd), 2);
      info =
        `The current total raised is:
          ${totalRaised} Ether
          $${totalRaisedUsd}` +
          `\nThe current wallet holds:
          ${_.trim(result[0], '\n')}
          ${_.trim(result[1], '\n')}` +
          `\nThere has been:
          ${_.trim(result[2], '\n')}` +
          `\nThe current ethereum price from etherscan is:
          ${ethusd} ETH/USD`
      console.log('result', result);
      util.postMessage(channel, info, true);
    })
  });
}
var scrapeEtherchainForSentTransactionsTotal = (callback, channel) => {
  var sentResults = []
  request("https://etherchain.org/account/0x13f11c9905a08ca76e3e853be63d4f0944326c72#txsent", (error, response, html) => {
    var $ = cheerio.load(html);
    $('#txsent div table.table tbody tr td:nth-child(3)').each((i, element) => {
      var text = $(element).text();
      text = /^[^ ]*/.exec(text)[0];
      sentResults.push(Number(text));
    })
    scrapeEtherscanForCurrentTotal(_.sum(sentResults), callback, channel);
  })

}
module.exports = function (param) {
  var channel = param.channel;
  console.log("\n***********************************\n" +
      +"\nscrapping\n"+
      "\n***********************************\n");
  scrapeEtherchainForSentTransactionsTotal(null, channel);
}
