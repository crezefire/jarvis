import * as parseit from "./parseit"

var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var MemoryDataStore = require('@slack/client').MemoryDataStore;

var token = process.env.SLACK_API_TOKEN || '';

function SendTypingMessage(args : Array<string>, arg_pos : number) : void {

}

function NoCall(args : Array<string>, arg_pos : number) : void {

}

//******************************************************************

const NO_USAGE = "-";

let jkl = new parseit.Command(":jkl:", 1, "Interact with jarvis", NO_USAGE, SendTypingMessage);

{
  let group = new parseit.Command("group", 1, "Manage groups", NO_USAGE, NoCall);
  jkl.AddChild(group);

  {
    let groupAdd = new parseit.Command("add", 2, "Add new group", "*<name>*", NoCall);
    group.AddChild(groupAdd);

    let groupList = new parseit.Command("ls", 0, "Lists all groups", NO_USAGE, NoCall);
    group.AddChild(groupList);

    let groupRemove = new parseit.Command("rm", 1, "Deletes the group", "*<groupname>*", NoCall);
    group.AddChild(groupRemove);
    
    let groupRename = new parseit.Command("mv", 1, "Renames the required group", "*<groupname>*", NoCall);
    group.AddChild(groupRename);
    
    let groupSave = new parseit.Command("save", 1, "Saves all groups to a file", "*<filename>*", NoCall);
    group.AddChild(groupSave);
    
    let groupLoad = new parseit.Command("load", 1, "Loads all groups from a file", "*<filename>*", NoCall);
    group.AddChild(groupLoad);
  }

  let user = new parseit.Command("user", 1,  "Manage users in groups", "", NoCall);
  jkl.AddChild(user);
  {
      let userAdd = new parseit.Command("add", 2,  "Add user(s) to a group", "*<groupname>* *<name>* *<name>* ...", NoCall);
      user.AddChild(userAdd);
      
      let userList = new parseit.Command("ls", 1,  "Lists all users in the group", "*<groupname>*", NoCall);
      user.AddChild(userList);
      
      let userRemove = new parseit.Command("rm", 2,  "Removes user(s) from a group", "*<groupname>* *<user>* *<@user>* ...", NoCall);
      user.AddChild(userRemove);
  }
  
  let buddy = new parseit.Command("buddy", 1,  "Selects a buddy from a group", "*<groupname>*", NoCall);
  jkl.AddChild(buddy);
  
  let message = new parseit.Command("msg", 2,  "Send DM to all users in a group", "*<groupname>* *<message>*", NoCall);
  jkl.AddChild(message);
  
  let version = new parseit.Command("version", 0,  "Get current version of Jarvis", NO_USAGE, NoCall);
  jkl.AddChild(version);
}

let command_parser = new parseit.Parser(jkl);
//******************************************************************

const endl = "\n";

var rtm = new RtmClient(token, {
  logLevel: 'error', // check this out for more on logger: https://github.com/winstonjs/winston
  dataStore: new MemoryDataStore() // pass a new MemoryDataStore instance to cache information
});

rtm.start();

//On Authentication
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function handleRTMAuthenticated(data) {
  console.log("Jarvis connected to " + data.team.name);
});

//Unable to start session
rtm.on(CLIENT_EVENTS.RTM.UNABLE_TO_RTM_START, function handleRTMAuthenticated(data) {
  console.log("Unable to start RTM ::=> " + data + endl);
});

//Disconnected
rtm.on(CLIENT_EVENTS.RTM.DISCONNECT, function handleRTMAuthenticated(data) {
  console.log("Disconnected from Slack ::=>" + data + endl);
});

//Reconnecting
rtm.on(CLIENT_EVENTS.RTM.ATTEMPTING_RECONNECT, function handleRTMAuthenticated(data) {
  console.log("Reconnecting to Slack ::=>" + data + endl);
});

//Message received
rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
    var currentChannel = rtm.dataStore.getChannelGroupOrDMById(message.channel);
    var currentUser = rtm.dataStore.getUserById(message.user);

    rtm.sendMessage("FUCK YOU MAN", message.channel);
});
