/******************************
- libcommander -
Vimarsh Raina
<me@vimarshraina.com>
*******************************/

var Command = function(name, minArgs, caseSensitive, description, usage, callback) {
	
	this.name = name;
	this.minArgs = minArgs;
	this.caseSensitive = caseSensitive;
	this.description = description;
	this.usage = usage;
	this.callback = callback;
	this.children = [];
	
	function FindCommand(commandString, array) {
		for(var i in array) {
			if(array[i].name == commandString)
				return true;
		}
		
		return false;
	}

	Command.prototype.AddChild = function (children) {
		if(FindCommand(children, this.children)) {
			return false;
		}
		
		this.children.push(children);		
		return true;
	}
}

var tabs = 0;

var libcom = function() {
	
	libcom.prototype.AddRootCommand = function(command) {
		this.RootCommand = command;
	}
	
	function processHelp(nextCommand, parent) {
		if(nextCommand == "help") {
			var str = new String();			
			str += parent.description + "\n";
			
			if(parent.children.length == 0) {
				str += "Usage: " + parent.usage;
			}
			else {
				str += "Usage: ";
				
				for(var i in parent.children) {
					str += parent.children[i].name;
					
					if(parent.children.length - i != 1)
						str += " | ";
				}
			}
			
			return str;
		}
		
		return "false";
	}
	
	function commandProcessor(commandsArray, currentIndex, parent) {
		if(commandsArray.length - currentIndex + 1 < parent.minArgs) {
			return "Insufficient commands entered";
		}
		
		if(parent.children.length > 0) {
			for(var i in parent.children) {
				if(parent.children[i].name == commandsArray[currentIndex]) {
					
					var help = processHelp(commandsArray[++currentIndex], parent.children[i]);
		
					if(help != "false")
						return help;
					
					return commandProcessor(commandsArray, ++currentIndex, parent.children[i]);
				}
			}
		}
		else {
			parent.callback(commandsArray.slice(currentIndex++));
			return "Success";	
		}
		
		return "Command not found";	
	}
	
	libcom.prototype.ProcessCommand = function(commandString) {
		var commands = commandString.split(" ");
		
		if(commands.length < this.RootCommand.minArgs)
			return "Insufficient commands entered";
			
		if(commands[0] == this.RootCommand.name) {
			
			var help = processHelp(commands[1], this.RootCommand);
			
			if(help != "false")
				return help;
			
			return commandProcessor(commands, 1, this.RootCommand);
		}
		
		return "Root command doesn't match";
	}
	
	function PrintTabs(num) {
		var str = new String();
		for(var j = 0; j < num; j++)
			str += "\t";
		
		return str;
	}
	
	function PrintCommand(command) {
		console.log(PrintTabs(tabs) + "Name: " + command.name);
		console.log(PrintTabs(tabs) + "Min Args: " + command.minArgs);
		console.log(PrintTabs(tabs) + "Case Sensitive: " + (command.caseSensitive ? "Yes" : "No"));
		console.log(PrintTabs(tabs) + "Description: " + command.description);
		console.log(PrintTabs(tabs) + "Usage: " + command.usage);
		tabs++;
		
		for(var i in command.children) {
			PrintCommand(command.children[i]);
			console.log("");
		}
		
		tabs--;
	}
	
	libcom.prototype.Test = function() {
		tabs = 0;
		PrintCommand(this.RootCommand);
	}
}

module.exports = libcom;
module.exports.LCommand = Command;