export class Command {
    private name : string;
	private min_args : number;
	private description : string;
	private usage : string;
	private callback : (args : Array<string>, arg_pos : number) => void;
	private children : Command[];

    constructor(_name : string, _min_args : number, _description : string,
                _usage : string, _callback : (args : Array<string>, arg_pos : number) => void) {
        
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
}

export class Parser {
    private root_command : Command;

    constructor(_root : Command) {
        this.root_command = _root;
    }

}