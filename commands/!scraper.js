// Parses our HTML and helps us find elements
var cheerio = require("cheerio");
// Makes HTTP request for HTML page
var request = require("request");
var util 	= require('../util');
var info = "";
// An empty array to save the data that we'll scrape
var results = [];
module.exports = function (param) {
  var channel = param.channel;
  // First, tell the console what server.js is doing
  console.log("\n***********************************\n" +
      "Grabbing every thread name and link\n" +
      "from reddit's webdev board:" +
      "\n***********************************\n");

  // Making a request for reddit's "webdev" board. The page's HTML is passed as the callback's third argument
  request("https://diviproject.org/terms.php", function (error, response, html) {

    // Load the HTML into cheerio and save it to a variable
    // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
    var $ = cheerio.load(html);


    // With cheerio, find each p-tag with the "title" class
    // (i: iterator. element: the current element)
    $("#ethKey").each(function (i, element) {

      // Save the text of the element in a "title" variable
      var title = $(element).text();
      var correctAddress = title.search('0x13f11C9905A08ca76e3e853bE63D4f0944326C72') !== -1;

      // In the currently selected element, look at its child elements (i.e., its a-tags),
      // then save the values for any "href" attributes that the child elements may have
      var link = $(element).children().attr("href");

      // Save these results in an object that we'll push into the results array we defined earlier
      results.push({
        title: title,
        correctAddress
      });
    });

    // Log the results once you've looped through each of the elements found with cheerio
    console.log(results);
    info = `The address is currently ${results[0].correctAddress ? 'correct' : 'incorrect'}`
    util.postMessage(channel, info);
  });
}
