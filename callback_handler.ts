import * as Groups from "./group_manager"

export class CallbackHandler {
    private slack_rtm : any;
    private current_message : any;
    private group_manager : Groups.GroupManager;
    private PRE_FORMAT : string = ">";
    
    constructor(_slack_rtm : any) {
        this.slack_rtm =  _slack_rtm;
        this.current_message = null;
        this.group_manager = new Groups.GroupManager();
    }

    private SendMessageToChannel(message : string) : void {
        this.slack_rtm.sendMessage(message, this.current_message.channel);
    }

    private SendIsTypingMessageToChannel(channel : string) : void {
        this.slack_rtm.sendTyping(channel);
    }

    private GetNameOfUser(id : string) : string {
        return this.slack_rtm.dataStore.getUserById(id);
    }

    private GetNameOfChannel(id : string) : string {
        return this.slack_rtm.dataStore.getChannelGroupOrDMById(id);
    }

    SetCurrentMessage(_current_message : any) : void {
        this.current_message = _current_message;
    }

    OnRootCommand(args : string[], arg_pos : number) : void {
        this.SendIsTypingMessageToChannel(this.current_message.channel);
    }

    OnGroupAdd(args : string[], arg_pos : number) : void {
        let groupName = args[arg_pos + 1];
        let message : string;
        
        if (!this.group_manager.CreateGroup(groupName)) {
            message = this.PRE_FORMAT + "Group *[" + groupName + "]*" + " already exists";
        }
        else {
            message = this.PRE_FORMAT + "Group *[" + groupName + "]*" + " created successfully";
        }

        this.SendMessageToChannel(message);
    }

    OnGroupList(args : string[], arg_pos : number) : void {
        let allGroups = this.group_manager.GetAllGroups();
        let message : string;

        if (allGroups.length <= 0) {
            message = this.PRE_FORMAT + "No Groups exists yet";
        }
        else {
            message = this.PRE_FORMAT + "Groups are: " + allGroups.join(", ");
        }

        this.SendMessageToChannel(message);
    }

    OnGroupRemove(args : string[], arg_pos : number) : void {
        let groupName = args[arg_pos + 1];
        let message : string;

        if (!this.group_manager.RemoveGroup(groupName)) {
            message = this.PRE_FORMAT + "Cannot find group *[" + groupName + "]*";
        }
        else {
            message = this.PRE_FORMAT + "Group *[" + groupName + "]* removed successfully"; 
        }

        this.SendMessageToChannel(message);
    }

}