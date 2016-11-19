"use strict";
var Command = (function () {
    function Command(_name, _min_args, _description, _usage, _callback) {
        this.name = _name;
        this.min_args = _min_args;
        this.description = _description;
        this.usage = _usage;
        this.callback = _callback;
        this.children = new Array();
    }
    Command.prototype.AddChild = function (node) {
        this.children.push(node);
    };
    return Command;
}());
exports.Command = Command;
var Parser = (function () {
    function Parser(_root) {
        this.root_command = _root;
    }
    return Parser;
}());
exports.Parser = Parser;
//# sourceMappingURL=parseit.js.map