var SlackClient = require("slack-client");
var slackClient = new SlackClient("xoxb-11323179413-lF9rQPuTFqwFNjZlvYdfUkpM");

var LibComModule = require('./libcommander');
var libcommander = new LibComModule();

var CallbackHandler = require('./callbackHandler');
var handler = new CallbackHandler();

var bot; // Track bot user .. for detecting messages by yourself

var isActive = true;

var noCall = function(args) {
    console.log(args);
    console.log("Incomplete Call");
}

slackClient.on('loggedIn', function(user, team) {
    bot = user;
    console.log("Logged in as " + user.name
        + " of " + team.name + ", but not yet connected");
});
 
slackClient.on('open', function() {
    console.log('Connected');
});

//***********************
var jklCommand = new LibComModule.LCommand(":jkl:", 2, false, "Interact with Jarvis", "-", noCall);
libcommander.AddRootCommand(jklCommand);

var groupCommand = new LibComModule.LCommand("group", 1, false, "Manage groups", "-", noCall);
jklCommand.AddChild(groupCommand);

var groupAddCommand = new LibComModule.LCommand("add", 2, false, "Add a new public/private group", "*type* *name*", handler.OnGroupAdd);
groupCommand.AddChild(groupAddCommand);

handler.SetupSlack(slackClient);
//***********************

slackClient.on('message', function(message) {
    if (message.user == bot.id) return; // Ignore bot's own messages
 
    var channel = slackClient.getChannelGroupOrDMByID(message.channel);
    
    var cleanMessage = message.text.replace(/@/g, '');

    slackClient._send({ type: "typing", channel: message.channel });
    
    handler.CurrentChannel(channel);
    
    var output = libcommander.ProcessCommand(cleanMessage);
    
    if(output != libcommander.SUCCESS) {
         channel.send(output);   
    }
});
 
slackClient.login();