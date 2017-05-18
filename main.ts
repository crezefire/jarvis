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

const NO_USAGE = "";

let jkl = new ParseIt.Command(
                              ":jkl:",
                              1,
                              "Interact with jarvis",
                              NO_USAGE,
                              callback_handler.OnRootCommand.bind(callback_handler)
                              );

{
  let group = new ParseIt.Command(
                                  "group",
                                  1,
                                  "Manage groups",
                                  NO_USAGE,
                                  NoCall
                                  );
  jkl.AddChild(group);

  {
    let groupAdd = new ParseIt.Command(
                                      "add",
                                      1,
                                      "Add new group",
                                      "*<name>*",
                                      callback_handler.OnGroupAdd.bind(callback_handler)
                                      );
    group.AddChild(groupAdd);

    let groupList = new ParseIt.Command(
                                        "ls",
                                        0,
                                        "Lists all groups",
                                        NO_USAGE,
                                        callback_handler.OnGroupList.bind(callback_handler)
                                        );
    group.AddChild(groupList);

    let groupRemove = new ParseIt.Command(
                                          "rm",
                                          1,
                                          "Deletes the group",
                                          "*<groupname>*",
                                          callback_handler.OnGroupRemove.bind(callback_handler)
                                          );
    group.AddChild(groupRemove);
    
    let groupRename = new ParseIt.Command(
                                          "mv",
                                          2,
                                          "Renames the required group",
                                          "*<old_groupname>* *<new_groupname>*",
                                          callback_handler.OnGroupRename.bind(callback_handler)
                                          );
    group.AddChild(groupRename);
    
    let groupSave = new ParseIt.Command(
                                        "save",
                                        1,
                                        "Saves all groups to a file",
                                        "*<filename>*",
                                        callback_handler.OnGroupSave.bind(callback_handler)
                                        );
    group.AddChild(groupSave);
    
    let groupLoad = new ParseIt.Command(
                                        "load",
                                        1,
                                        "Loads all groups from a file",
                                        "*<filename>*",
                                        callback_handler.OnGroupLoad.bind(callback_handler)
                                        );
    group.AddChild(groupLoad);
  }

  let user = new ParseIt.Command(
                                "user",
                                1,
                                "Manage users in groups",
                                "",
                                NoCall
                                );
  jkl.AddChild(user);

  {
      let userAdd = new ParseIt.Command(
                                        "add",
                                        2,
                                        "Add user(s) to a group",
                                        "*<groupname>* *<name>* *<name>* ...",
                                        callback_handler.OnUserAdd.bind(callback_handler)
                                        );
      user.AddChild(userAdd);
      
      let userList = new ParseIt.Command(
                                        "ls",
                                        1,
                                        "Lists all users in the group",
                                        "*<groupname>*",
                                        callback_handler.OnUserList.bind(callback_handler)
                                        );
      user.AddChild(userList);
      
      let userRemove = new ParseIt.Command(
                                          "rm",
                                          2,
                                          "Removes user(s) from a group",
                                          "*<groupname>* *<user>* *<@user>* ...",
                                          callback_handler.OnUserRemove.bind(callback_handler)
                                          );
      user.AddChild(userRemove);
  }
  
  let buddy = new ParseIt.Command(
                                  "buddy",
                                  1,
                                  "Selects a buddy from a group",
                                  "*<groupname>*",
                                  callback_handler.OnPickBuddy.bind(callback_handler)
                                  );
  jkl.AddChild(buddy);
}

const MIN_ROOT_MESSAGE_LENGTH = 6;
const MAX_ROOT_MESSAGE_LENGTH = 500;
let command_parser = new ParseIt.Parser(jkl, MIN_ROOT_MESSAGE_LENGTH, MAX_ROOT_MESSAGE_LENGTH);

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

    if(!message.hasOwnProperty('text'))
        return;
        
    if(!message.hasOwnProperty('channel'))
        return;

    callback_handler.SetCurrentMessage(message);

    let parse_result = command_parser.ParseCommand(message.text);

    let error_message = ">";

    switch (parse_result) {
      case ParseIt.ParserError.INSUFFICIENT_ARGUMENTS:
        error_message += "Insufficient arguments provided for command *[" + command_parser.GetLastError() + "]*.\n>Type *help* after to a command to view it's uasge.";
        break;
      
      case ParseIt.ParserError.COMMAND_NOT_FOUND:
        error_message += "Command *[" + command_parser.GetLastError() + "]* not found!"; 
        break;

      default:
        break;
    }

    if (error_message != ">") {
      rtm.sendMessage(error_message, message.channel);
    }
});
