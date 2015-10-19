var SlackClient = require("slack-client");
var slackClient = new SlackClient("xoxb-11323179413-2JUzcNpuzl8cwjHyJSEWxzb1");

var LibComModule = require('./libcommander');
var libcommander = new LibComModule();

var CallbackHandler = require('./callbackHandler');
var handler = new CallbackHandler();

var MAX_MESSAGE_LENGTH = 512;

var bot; // Track bot user .. for detecting messages by yourself

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
var jkl = new LibComModule.LCommand(":jkl:", 1, false, "Interact with Jarvis", "-", noCall);
libcommander.AddRootCommand(jkl);
{
    var group = new LibComModule.LCommand("group", 1, false, "Manage groups", "-", noCall);
    jkl.AddChild(group);
    {
        var groupAdd = new LibComModule.LCommand("add", 2, false, "Add a new public/private group", "*type* *name*", handler.OnGroupAdd);
        group.AddChild(groupAdd);
        
        var groupList = new LibComModule.LCommand("ls", 1, false, "Lists the required group", "*groupname*", handler.OnGroupList);
        group.AddChild(groupList);
        
        var groupRemove = new LibComModule.LCommand("rm", 1, false, "Deletes the group", "*groupname*", handler.OnGroupRemove);
        group.AddChild(groupRemove);
        
        var groupRename = new LibComModule.LCommand("mv", 1, false, "Renames the required group", "*groupname*", handler.OnGroupRename);
        group.AddChild(groupRename);
        
        var groupSave = new LibComModule.LCommand("save", 1, false, "Saves all groups to a file", "*filename*", handler.SaveGroups);
        group.AddChild(groupSave);
        
        var groupLoad = new LibComModule.LCommand("load", 1, false, "Loads all groups from a file", "*filename*", handler.LoadGroups);
        group.AddChild(groupLoad);
    }

    var user = new LibComModule.LCommand("user", 1, false, "Manage users in groups", "", noCall);
    jkl.AddChild(user);
    {
        var userAdd = new LibComModule.LCommand("add", 2, false, "Add user(s) to a group", "*groupname* *name* *name* ...", handler.OnUserAdd);
        user.AddChild(userAdd);
        
        var userList = new LibComModule.LCommand("ls", 1, false, "Lists all users in the group", "*groupname*", handler.OnUserList);
        user.AddChild(userList);
        
        var userRemove = new LibComModule.LCommand("rm", 2, false, "Removes user(s) from a group", "*groupname* *user* *user* ...", handler.OnUserRemove);
        user.AddChild(userRemove);
    }
    
    var buddy = new LibComModule.LCommand(":game_die:", 1, false, "Selects a buddy from a group", "*groupname*", handler.Buddy);
    jkl.AddChild(buddy);
    
    var message = new LibComModule.LCommand("msg", 2, false, "Send DM to all users in a group", "*groupname* *message*", handler.SendMessage);
    jkl.AddChild(message);
    
    var version = new LibComModule.LCommand("version", 0, false, "Get current version of Jarvis", "-", handler.GetVersion);
    jkl.AddChild(version);
}

handler.SetupSlack(slackClient);
//***********************

slackClient.on('message', function(message) {
    if (message.user == bot.id) return; // Ignore bot's own messages
    
    //very dirty solution, need a better way to check
    if(message.text[0] == ":" && message.text[1] == "j" && message.text[2] == "k"
        && message.text.length <= MAX_MESSAGE_LENGTH)
    {}
    else
    {return;}
 
    var channel = slackClient.getChannelGroupOrDMByID(message.channel);
    
    var cleanMessage = message.text.replace(/@/g, '');

    handler.CurrentChannel(channel);
    handler.ChannelID(message.channel);
    handler.CurrentUser(message.user);
    
    var output = libcommander.ProcessCommand(cleanMessage);
    
    if(output != "Success" && output != "Root command doesn't match") {
         channel.send(output);   
    }
});
 
slackClient.login();