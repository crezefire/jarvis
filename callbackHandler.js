var groups_lib = require("./jarvis-group");
var groups = new groups_lib();

var CURRENT_VERSION = "0.9.1";

var CallbackHandler = function() {
	
	var slackChannel;
	var slackClient;
	var channelID;
	var currentUser;
	
	CallbackHandler.prototype.SetupSlack = function(client) {
		slackClient = client;
	}
	
	CallbackHandler.prototype.CurrentChannel = function(channel) {
		slackChannel = channel;
	}
	
	CallbackHandler.prototype.ChannelID = function (ID) {
		channelID = ID;
	}
	
	CallbackHandler.prototype.CurrentUser = function(user) {
		currentUser = user;
	}
	
	CallbackHandler.prototype.OnGroupAdd = function(args) {
		slackClient._send({ type: "typing", channel: channelID });
		
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
			slackChannel.send(">Unrecognized group type `" + args[0] + "`. Available types are: *public*, *private*");
		}
	}
	
	CallbackHandler.prototype.OnGroupList = function(args) {
		slackClient._send({ type: "typing", channel: channelID });
		
		var list = groups.GroupList();
		if(list != null) 
			slackChannel.send(">Available groups: " + list);
		else
			slackChannel.send(">No groups exist........yet");
	}
	
	CallbackHandler.prototype.OnGroupRemove = function(args) {
		slackClient._send({ type: "typing", channel: channelID });
		
		var result = groups.RemoveGroup(args[0]);
		
		if(result == true) {
			slackChannel.send(">Group *" + args[0] + "* removed!!");
		}
		else {
			slackChannel.send(">Group ```" + args[0] + "``` doesn't exist.");
		}
	}
	
	CallbackHandler.prototype.OnGroupRename = function(args) {
		slackClient._send({ type: "typing", channel: channelID });
		
		var result = groups.RenameGroup(args[0], args[1]);
		
		if(result == true) {
			slackChannel.send(">Group renamed!!");
		}
		else {
			slackChannel.send(">Group ```" + args[0] + "``` doesn't exist.");
		}
	}
	
	CallbackHandler.prototype.OnUserAdd = function(args) {
		slackClient._send({ type: "typing", channel: channelID });
		
		var allUsers = [];
		var notFound = new String();

		for(var i = 1; i < args.length; i++) {
			
			//TODO(vim): Only keep alpha numeric
			var cleanUser = args[i].replace(/</g, '');
			cleanUser = cleanUser.replace(/>/g, '');
			
			var usr = slackClient.getUserByID(cleanUser);

			if(usr == undefined) {
				usr = slackClient.getUserByName(cleanUser);
				
				if(usr != undefined)
					allUsers.push(usr.id);
				else
					notFound += String(args[i]) + ", ";
			}
			else
				allUsers.push(usr.id);
		}

		if(notFound.length != 0) {    
			slackChannel.send(">Users not found: " + notFound);
			return;
		}

		if(groups.AddUserToGroup(allUsers, args[0])) {
			slackChannel.send(">Users added to group *" + args[0] + "*");
		} else {
			slackChannel.send(">Group *" + args[0] + "* doesn't exist!");
		}
	}
	
	CallbackHandler.prototype.OnUserList = function(args) {
		slackClient._send({ type: "typing", channel: channelID });
		
		var list = groups.GetUsersOfGroup(args[0], slackClient);
		if(list != null) 
			slackChannel.send(">Users in group *" + args[0] + "*: " + list);
		else
			slackChannel.send(">Group doesn't exist or no users added yet");
	}
	
	CallbackHandler.prototype.OnUserRemove = function(args) {
		slackClient._send({ type: "typing", channel: channelID });
		
		var allUsers = [];
		var notFound = new String();

		for(var i = 1; i < args.length; i++) {
			
			//TODO(vim): Only keep alpha numeric
			var cleanUser = args[i].replace(/</g, '');
			cleanUser = cleanUser.replace(/>/g, '');
			
			var usr = slackClient.getUserByID(cleanUser);

			if(usr == undefined) {
				usr = slackClient.getUserByName(cleanUser);
				
				if(usr != undefined)
					allUsers.push(usr.id);
				else
					notFound += String(args[i]) + ", ";
			}
			else
				allUsers.push(usr.id);
		}

		if(notFound.length != 0) {    
			slackChannel.send(">Users not found: " + notFound);
		}
		
		if(allUsers.length <= 0) {
			slackChannel.send(">No users to remove!!");
			return;
		}

		if(groups.RemoveUserFromGroup(allUsers, args[0])) {
			slackChannel.send(">Users removed from group *" + args[0] + "*");
		} else {
			slackChannel.send(">Group *" + args[0] + "* doesn't exist!");
		}
	}
	
	CallbackHandler.prototype.Buddy = function(args) {
		if(!groups.SelectBuddy(args[0], currentUser, slackChannel, slackClient)) {
			slackChannel.send(">Group *" + args[0] + "* doesn't exist!");
		}
	}
	
	CallbackHandler.prototype.SendMessage = function(args) {
		var message = new String();
		for(var i = 1; i < args.length; ++i) {
			message += args[i] + " ";
		}
		
		if(!groups.SendMessage(args[0], currentUser, message, slackClient)) {
			slackChannel.send(">Group *" + args[0] + "* doesn't exist!");
		}
	}
	
	CallbackHandler.prototype.GetVersion = function(args) {
		slackChannel.send("Jarvis: " + CURRENT_VERSION);
	}
	
	CallbackHandler.prototype.SaveGroups = function(args) {
		groups.SaveGroupsToFile(args[0]);
	}
	
	CallbackHandler.prototype.LoadGroups = function(args) {
		groups.LoadGroupsFromFile(args[0]);
	}

}

module.exports = CallbackHandler;