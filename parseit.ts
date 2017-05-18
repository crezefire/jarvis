export class Command {
    private name : string;
	private min_args : number;
	private description : string;
	private usage : string;
	private callback : (args : string[], arg_pos : number) => void;
	private children : Command[];

    constructor(_name : string, _min_args : number, _description : string,
                _usage : string,
                 _callback : (args : string[], arg_pos : number) => void) {
        
        this.name = _name;
        this.min_args = _min_args;
        this.description = _description;
        this.usage = _usage;
        this.callback = _callback;
        this.children = new Array<Command>();
    }

    AddChild(node : Command) : void {
        this.children.push(node);
    }

    Name() : string {
        return this.name;
    }

    MinArgs() : number {
        return this.min_args;
    }

    InvokeCallback(args : string[], arg_pos : number) : void {
        this.callback(args, arg_pos);
    }

    Children() : Command[] {
        return this.children;
    }

    Usage() : string {
        return this.usage;
    }

    Description() : string {
        return this.description;
    }
}

export enum ParserError {
    SUCCESS,
    INVALID_MESSAGE_LENGTH,
    INSUFFICIENT_ARGUMENTS,
    ROOT_COMMAND_MISMATCH,
    COMMAND_NOT_FOUND
}

export class Parser {
    private root_command : Command;
    private min_root_message_length : number;
    private max_root_message_length : number;
    private last_error_command : string;
    private help_callback : (message : string) => void;
    private current_message : string;

    constructor(_root : Command, min_message_length : number, max_message_length : number, _callback : (message : string) => void ) {
        this.root_command = _root;
        this.min_root_message_length = min_message_length;
        this.max_root_message_length = max_message_length;
        this.help_callback = _callback;
        this.current_message = "";
    }

    private ProcessSubCommands(commands : string[], index : number, parent : Command) : ParserError {
        if (commands.length - index  < parent.MinArgs()) {
            this.last_error_command = commands[index - 1];
            return ParserError.INSUFFICIENT_ARGUMENTS;
        }

        let children = parent.Children();
        if (children.length > 0) {
            
            for (let child of children) {
                if (child.Name() == commands[index]) {
                    
                    let nextIndex = index + 1;
                    if (commands.length > nextIndex && commands[nextIndex] == "help") {
                        return this.ProcessHelpForCommand(child, 0, true);
                    }
                    
                    return this.ProcessSubCommands(commands, ++index, child);
                }
            }
        }
        else {
            parent.InvokeCallback(commands, index - 1);
            return ParserError.SUCCESS;
        }

        this.last_error_command = commands[index];
        return ParserError.COMMAND_NOT_FOUND;
    }

    ParseCommand(message : string) : ParserError {
        if (message.length < this.min_root_message_length ||
            message.length > this.max_root_message_length) {
                return ParserError.INVALID_MESSAGE_LENGTH;
            }
        
        let lower_case = message.toLowerCase();
        let sanite_spaces = lower_case.replace(/  +/g, ' ');
        let commands = sanite_spaces.split(" ");

        if (commands.length < this.root_command.MinArgs()) {
            return ParserError.INSUFFICIENT_ARGUMENTS;
        }

        if (this.root_command.Name() != commands[0]) {
            return ParserError.ROOT_COMMAND_MISMATCH;
        }

        this.root_command.InvokeCallback(commands, 0);

        if (commands.length >= 1 && commands[1] == "help") {
            return this.ProcessHelpForCommand(this.root_command, 0, true);
        }

        return this.ProcessSubCommands(commands, 1, this.root_command);
    }

    private GetCommandHelpStr(command : Command, prepend_tabs : number) : string {
        let str = ">" + this.Tabify(prepend_tabs) + command.Name() + "\t\t\t";
            
        let usage = command.Usage();
        if (usage.length > 0) {
            str += usage;
        }

        let description = command.Description();
        if (description.length > 0) {
            str += " (" + description + ")";
        }

        str += "\n";

        return str;
    }

    private Tabify(num_tabs : number) : string {
        let str = "";

        if (num_tabs <= 0) {
            return str;
        }

        for (let i = 0; i < num_tabs; ++i) {
            str += "\t";
        }

        return str;
    }

    ProcessHelpForCommand(arg_command : Command, num_tabs : number, to_dispatch : boolean = false) : ParserError {
        if (to_dispatch) {
            this.current_message += this.GetCommandHelpStr(arg_command, num_tabs);
        }

        let children = arg_command.Children();
        for (let child of children) {
            this.current_message += this.GetCommandHelpStr(child, num_tabs + 1);

            this.ProcessHelpForCommand(child, num_tabs + 1);
        }

        if (children.length > 0) {
            this.current_message += "\n";
        }

        if (to_dispatch) {
            this.help_callback(this.current_message);
            this.current_message = "";
        }

        return ParserError.SUCCESS;
    }

    GetLastError() : string {
        return this.last_error_command;
    }
}