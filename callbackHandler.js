var groups_lib = require("./jarvis-group");
var groups = new groups_lib();

var slackChannel;
var slackClient;

var CallbackHandler = function() {
	
	CallbackHandler.prototype.SetupSlack = function(client) {
		slackClient = client;
	}
	
	CallbackHandler.prototype.CurrentChannel = function(channel) {
		slackChannel = channel;
	}
	
	CallbackHandler.prototype.OnGroupAdd = function(args) {
		slackChannel.send("HIYA!!");
	}

}

module.exports = CallbackHandler;