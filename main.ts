import * as ParseIt from "./parseit"
import * as Handler from "./callback_handler"

var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var MemoryDataStore = require('@slack/client').MemoryDataStore;

var token = process.env.SLACK_API_TOKEN || '';

const endl = "\n";

var rtm = new RtmClient(token, {
  logLevel: 'error', // check this out for more on logger: https://github.com/winstonjs/winston
  dataStore: new MemoryDataStore() // pass a new MemoryDataStore instance to cache information
});

function NoCall(args : string[], arg_pos : number) : void {
  console.log("No Callback defined ::=>" + args.join(" "));
}

let callback_handler = new Handler.CallbackHandler(rtm);

const NO_USAGE = "-";

let jkl = new ParseIt.Command(":jkl:", 1, "Interact with jarvis", NO_USAGE, callback_handler.OnRootCommand.bind(callback_handler));

{
  let group = new ParseIt.Command("group", 1, "Manage groups", NO_USAGE, NoCall);
  jkl.AddChild(group);

  {
    let groupAdd = new ParseIt.Command("add", 2, "Add new group", "*<name>*", NoCall);
    group.AddChild(groupAdd);

    let groupList = new ParseIt.Command("ls", 0, "Lists all groups", NO_USAGE, NoCall);
    group.AddChild(groupList);

    let groupRemove = new ParseIt.Command("rm", 1, "Deletes the group", "*<groupname>*", NoCall);
    group.AddChild(groupRemove);
    
    let groupRename = new ParseIt.Command("mv", 1, "Renames the required group", "*<groupname>*", NoCall);
    group.AddChild(groupRename);
    
    let groupSave = new ParseIt.Command("save", 1, "Saves all groups to a file", "*<filename>*", NoCall);
    group.AddChild(groupSave);
    
    let groupLoad = new ParseIt.Command("load", 1, "Loads all groups from a file", "*<filename>*", NoCall);
    group.AddChild(groupLoad);
  }

  let user = new ParseIt.Command("user", 1,  "Manage users in groups", "", NoCall);
  jkl.AddChild(user);
  {
      let userAdd = new ParseIt.Command("add", 2,  "Add user(s) to a group", "*<groupname>* *<name>* *<name>* ...", NoCall);
      user.AddChild(userAdd);
      
      let userList = new ParseIt.Command("ls", 1,  "Lists all users in the group", "*<groupname>*", NoCall);
      user.AddChild(userList);
      
      let userRemove = new ParseIt.Command("rm", 2,  "Removes user(s) from a group", "*<groupname>* *<user>* *<@user>* ...", NoCall);
      user.AddChild(userRemove);
  }
  
  let buddy = new ParseIt.Command("buddy", 1,  "Selects a buddy from a group", "*<groupname>*", NoCall);
  jkl.AddChild(buddy);
  
  let message = new ParseIt.Command("msg", 2,  "Send DM to all users in a group", "*<groupname>* *<message>*", NoCall);
  jkl.AddChild(message);
  
  let version = new ParseIt.Command("version", 0,  "Get current version of Jarvis", NO_USAGE, NoCall);
  jkl.AddChild(version);
}

let command_parser = new ParseIt.Parser(jkl, 6, 100);

rtm.start();

//On Authentication
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function handleRTMAuthenticated(data) {
  console.log("Jarvis connected to " + data.team.name + endl);
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
    callback_handler.SetCurrentMessage(message);

    command_parser.ParseCommand(message.text);
});
