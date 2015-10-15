var SlackClient = require("slack-client");
var groups_lib = require("./jarvis-group");
var groups = new groups_lib();

var slackClient = new SlackClient("xoxb-11323179413-lF9rQPuTFqwFNjZlvYdfUkpM");

var bot; // Track bot user .. for detecting messages by yourself

var isActive = true;

slackClient.on('loggedIn', function(user, team) {
    bot = user;
    console.log("Logged in as " + user.name
        + " of " + team.name + ", but not yet connected");
});
 
slackClient.on('open', function() {
    console.log('Connected');
});

slackClient.on('message', function(message) {
    if (message.user == bot.id) return; // Ignore bot's own messages
 
    var channel = slackClient.getChannelGroupOrDMByID(message.channel);
    
    var text = message.text.replace(/@/g, '');

    slackClient._send({ type: "typing", channel: message.channel });
    
    channel.send("Hola");
});
 
slackClient.login();