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
		if(args[0].toLowerCase() == "public") {
			if(groups.AddGroup(args[1])) {
				slackChannel.send(">Group *" + args[1] + "* created successfully ")
			}
			else {
				slackChannel.send(">Group already exists");
			}
		}
		else if(args[0].toLowerCase() == "private") {
			slackChannel.send(">Private groups are currently unsupported!!");
		}
		else {
			slackChannel.send(">Unrecognized group type `" + args[1] + "`. Available types are: *public*, *private*");
		}
	}
	
	CallbackHandler.prototype.OnGroupList = function(args) {
		var list = groups.GroupList();
		if(list != null) 
			slackChannel.send(">Available groups: " + list);
		else
			slackChannel.send(">No groups exist........yet");
	}
	
	CallbackHandler.prototype.OnGroupRemove = function(args) {
		var result = groups.RemoveGroup(args[0]);
		
		if(result == true) {
			slackChannel.send(">Group removed!!");
		}
		else {
			slackChannel.send(">Group doesn't exist.");
		}
	}
	
	CallbackHandler.prototype.OnGroupRename = function(args) {
		var result = groups.RenameGroup(args[0], args[1]);
		
		if(result == true) {
			slackChannel.send(">Group renamed!!");
		}
		else {
			slackChannel.send(">Group doesn't exist.");
		}
	}

}

module.exports = CallbackHandler;