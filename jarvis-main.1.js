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

var groupCommands = function(commandList, user, channel) {
    switch(commandList[2])
    {
        case "add":
            const add_help = "Usage: `group add *type* *name*`";
            if(commandList.length < 3) {
                channel.send(">Missing arguments. ");
                break;
            }

            if(commandList[3] == "help") {
                channel.send(add_help);
                break;
            }

            if(commandList[3].toLowerCase() == "public") {
                if(groups.AddGroup(commandList[4])) {
                    channel.send(">Group *" + commandList[4] + "* created successfully ")
                } else {
                    channel.send(">Group already exists");
                }
            } else if(commandList[3].toLowerCase() == "private") {
                channel.send(">Private groups are currently unsupported!!");
            } else {
                channel.send(">Unrecognized group type `" + commandList[3] + "`. Available types are: *public*, *private*");
            }
            break;

        case "list":
            var list = groups.GroupList();
            if(list != null) 
                channel.send(">Available groups: " + list);
            else
                channel.send(">No groups exists........yet");
            break;

        case "adduser":
        const adduser_help = "Usage: `group adduser *group* *name1* *name2* ...`";
            if(commandList.length < 3) {
                channel.send(">Missing arguments. " + adduser_help);
                break;
            }

            if(commandList[3] == "help") {
                channel.send(adduser_help);
                break;
            }

            var allUsers = [];
            var notFound = new String();
            //console.log("Length: " + commandList.length);
            for(var i = 4; i < commandList.length; i++) {
                var usr = slackClient.getUserByName(commandList[i]);
                //console.log("usr: " + usr + " for " + commandList[i]);
                if(usr != undefined)
                    allUsers.push(usr.id);
                else
                    notFound += String(commandList[i]) + ", ";
            }

            if(notFound.length != 0) {    
                channel.send(">Users not found: " + notFound);
                break;
            }

            if(groups.AddUserToGroup(allUsers, commandList[3])) {
                channel.send(">Users added to group *" + commandList[3] + "*");
            } else {
                channel.send(">Group *" + commandList[3] + "* doesn't exist!");
            }
            break;

        case "listuser":
            const listuser_help = "Usage: `group listuser *name*`";
            if(commandList[3] == "help") {
                channel.send(listuser_help);
                break;
            }

            var list = groups.GetUsersOfGroup(commandList[3], slackClient);
            if(list != null) 
                channel.send(">Users in group *" + commandList[3] + "*: " + list);
            else
                channel.send(">Group doesn't exist or no users added yet");
            break;

        case "remind":
            console.log("group remind");
            break;

        case "help":
            channel.send("Available Commands: group + `add | adduser | list | listuser | remind | help`\nHelp available for each subcommand");
            break;

        default:
            channel.send(">Cannot identify group subcommand: " + commandList[2]);
            break;
    }
}

slackClient.on('message', function(message) {
    if (message.user == bot.id) return; // Ignore bot's own messages
 
    var channel = slackClient.getChannelGroupOrDMByID(message.channel);
    
    var text = message.text.replace(/@/g, '');

    var commands = message.text.split(" ");

    if(commands[0] != "jkl")
        return;

    slackClient._send({ type: "typing", channel: message.channel });

    switch(commands[1])
    {
    	case "dc":
    		channel.send("Good Bye @" + slackClient.getUserByID(message.user).name.toString());
    		slackClient.disconnect();
    		break;

    	case "goaway":
    		channel.send("I'm sorry that you don't like me");
    		isActive = false;
    		slackClient.setPresence("away");
    		break;

    	case "comeback":
    		channel.send("Good morning!!");
    		isActive = true;
    		slackClient.setPresence("active");
    		break;

        case "group":
            groupCommands(commands, message.user, channel);
            break;

        case "help":
            channel.send("Avaiable Commands: jkl + `dc | goaway | comeback | group`\nHelp available for each subcommand");
            break;

    	default:
    		channel.send("Command not recognized");
    		break;
    }
});
 
slackClient.login();