// example from original repo
var request = require('request'),
	util 	= require('../util');

module.exports = function (param) {
	var	channel		= param.channel
	var	endpoint	= param.commandConfig.endpoint.replace('{gem}', param.args[0]);
	var info = []

		util.postMessage(channel, info.join('\n\n'));
};