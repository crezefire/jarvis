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

    private CheckSplitSend(arg : boolean, message1 : string, message2 : string) : void {

        if (arg) {
            this.SendMessageToChannel(message1);
        }
        else {
            this.SendMessageToChannel(message2);
        }
    }

    SetCurrentMessage(_current_message : any) : void {
        this.current_message = _current_message;
    }

    OnRootCommand(args : string[], arg_pos : number) : void {
        this.SendIsTypingMessageToChannel(this.current_message.channel);
    }

    OnGroupAdd(args : string[], arg_pos : number) : void {
        let group_name = args[arg_pos + 1];

        this.CheckSplitSend(
            !this.group_manager.CreateGroup(group_name),
            this.PRE_FORMAT + "Group *[" + group_name + "]*" + " already exists",
            this.PRE_FORMAT + "Group *[" + group_name + "]*" + " created successfully"
        );
    }

    OnGroupList(args : string[], arg_pos : number) : void {
        let all_groups = this.group_manager.GetAllGroups();

        this.CheckSplitSend(
            all_groups.length <= 0,
            this.PRE_FORMAT + "No Groups exists yet",
            this.PRE_FORMAT + "Groups are: " + all_groups.join(", ")
        );
    }

    OnGroupRemove(args : string[], arg_pos : number) : void {
        let group_name = args[arg_pos + 1];

        this.CheckSplitSend(
            !this.group_manager.RemoveGroup(group_name),
            this.PRE_FORMAT + "Cannot find group *[" + group_name + "]*",
            this.PRE_FORMAT + "Group *[" + group_name + "]* removed successfully"
        );
    }

    OnGroupRename(args : string[], arg_pos : number) : void {
        let old_group_name = args[arg_pos + 1];
        let new_group_name = args[arg_pos + 2];

        this.CheckSplitSend(
            !this.group_manager.RenameGroup(old_group_name, new_group_name),
            this.PRE_FORMAT + "Cannot find group *[" + old_group_name + "]*",
            this.PRE_FORMAT + "Group *[" + old_group_name + "]* renamed successfully to *[" + new_group_name + "]*"
        );
    }

}