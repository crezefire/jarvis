/******************************
- libcommander -
Vimarsh Raina
<me@vimarshraina.com>
*******************************/
var LibComModule = require('./libcommander');
var libcommander = new LibComModule();

var jklCommand = new LibComModule.LCommand("jkl", 2, false, "Interact with Jarvis", "-", function(args) {
	console.log("Callback jkl");
});

libcommander.AddRootCommand(jklCommand);

var groupCommand = new LibComModule.LCommand("group", 2, false, "Add, remove and manip groups", "-", function(args) {
	console.log("Callback group");
});

jklCommand.AddChild(groupCommand);

var addCommand = new LibComModule.LCommand("add", 1, false, "Create new group", "*type* *name*", function(args) {
	console.log("Callback add");
});

groupCommand.AddChild(addCommand);

var listCommand = new LibComModule.LCommand("list", 1, false, "Lists existing groups", "-", function(args) {
	console.log("Callback list");
	console.log(args);
});

groupCommand.AddChild(listCommand);

console.log(libcommander.ProcessCommand("jkl group"));

//libcommander.Test();