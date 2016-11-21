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
}

export enum ParserError {
    SUCCESS,
    INVALID_MESSAGE_LENGTH,
    INSUFFICIENT_ARGUMENTS,
    ROOT_COMMAND_MISMATCh
}

export class Parser {
    private root_command : Command;
    private min_root_message_length : number;
    private max_root_message_length : number;

    constructor(_root : Command, min_message_length : number, max_message_length : number) {
        this.root_command = _root;
        this.min_root_message_length = min_message_length;
        this.max_root_message_length = max_message_length;
    }

    private ProcessSubCommands(commands : string[], index : number, parent : Command) : ParserError {
        if (commands.length - index  < parent.MinArgs()) {
            return ParserError.INSUFFICIENT_ARGUMENTS;
        }

        let children = parent.Children();

        if (children.length > 0) {
            
            for (let child of children) {
                if (child.Name() == commands[index]) {
                    return this.ProcessSubCommands(commands, ++index, child);
                }
            }
        }
        else {
            parent.InvokeCallback(commands, index - 1);
        }

        return ParserError.SUCCESS;
    }

    ParseCommand(message : string) : ParserError {
        if (message.length < this.min_root_message_length ||
            message.length > this.max_root_message_length) {
                return ParserError.INVALID_MESSAGE_LENGTH;
            }
        
        let sanite_spaces = message.replace(/  +/g, ' ');
        let commands = sanite_spaces.split(" ");

        if (commands.length < this.root_command.MinArgs()) {
            return ParserError.INSUFFICIENT_ARGUMENTS;
        }

        if (this.root_command.Name() != commands[0]) {
            return ParserError.ROOT_COMMAND_MISMATCh;
        }

        this.root_command.InvokeCallback(commands, 0);

        return this.ProcessSubCommands(commands, 1, this.root_command);
    }
}