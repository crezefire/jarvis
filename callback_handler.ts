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
        this.slack_rtm.sendMessage(this.PRE_FORMAT + message, this.current_message.channel);
    }

    private SendIsTypingMessageToChannel(channel : string) : void {
        this.slack_rtm.sendTyping(channel);
    }

    private GetNameOfUser(id : string) : any {
        return this.slack_rtm.dataStore.getUserById(id);
    }

    private GetIdOfUser(name: string) : any {
        return this.slack_rtm.dataStore.getUserByName(name);
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
            "Group *[" + group_name + "]*" + " already exists",
            "Group *[" + group_name + "]*" + " created successfully"
        );
    }

    OnGroupList(args : string[], arg_pos : number) : void {
        let all_groups = this.group_manager.GetAllGroups();

        this.CheckSplitSend(
            all_groups.length <= 0,
            "No Groups exists yet",
            "Groups are: " + all_groups.join(", ")
        );
    }

    OnGroupRemove(args : string[], arg_pos : number) : void {
        let group_name = args[arg_pos + 1];

        this.CheckSplitSend(
            !this.group_manager.RemoveGroup(group_name),
            "Cannot find group *[" + group_name + "]*",
            "Group *[" + group_name + "]* removed successfully"
        );
    }

    OnGroupRename(args : string[], arg_pos : number) : void {
        let old_group_name = args[arg_pos + 1];
        let new_group_name = args[arg_pos + 2];

        this.CheckSplitSend(
            !this.group_manager.RenameGroup(old_group_name, new_group_name),
            "Cannot find group *[" + old_group_name + "]*",
            "Group *[" + old_group_name + "]* renamed successfully to *[" + new_group_name + "]*"
        );
    }

    OnGroupSave(args : string[], arg_pos : number) : void {
        let file_name = args[arg_pos + 1];

        this.group_manager.SaveGroupsToFile(file_name);

        this.SendMessageToChannel("Groups saved to file *[" + file_name + "]*");
    }

    OnGroupLoad(args : string[], arg_pos : number) : void {
        let file_name = args[arg_pos + 1];

        this.CheckSplitSend(
          this.group_manager.LoadGroupsFromFile(file_name),
          "Groups loaded successfully",
          "Failed to load groups from file: *[" + file_name + "]*"  
        );
    }

    OnUserAdd(args : string[], arg_pos : number) : void {
        let group_name = args[arg_pos + 1];
        let found = new Array<string>();
        let not_found = new Array<string>();

        for (let i = arg_pos + 2; i < args.length; ++i) {
            let current_user = args[i];
            let user_id : any;

            if (current_user.indexOf("@") >= 0) {
                user_id = current_user.substr(2, current_user.length - 3);
            }
            else {
                user_id = this.GetIdOfUser(current_user);
                
                if (user_id === undefined || user_id == null) {
                    user_id = null;
                }
                else {
                    user_id = user_id.id;
                }
            }

            if (user_id == null) {
                not_found.push(current_user);
            }
            else {
                found.push(user_id.toUpperCase());
            }
        }

        let users_added = this.group_manager.AddUsersToGroup(group_name, found);

        if (!users_added) {
            this.SendMessageToChannel("Cannot find group *[" + group_name + "]*");
            return;
        }

        if (not_found.length > 0) {
            this.SendMessageToChannel("Users not found: " + not_found.join(", "));
        }

        if (found.length > 0) {
            let all_users = <string[]>this.group_manager.ListUsersOfGroup(group_name);
            let named_users = new Array<string>();

            for (let i = 0; i < all_users.length; ++i) {
                let user_name = this.GetNameOfUser(all_users[i]);

                if(user_name === undefined || user_name == null) {
                    continue;
                }

                named_users.push(user_name.name);
            }
            
            this.SendMessageToChannel(
                "New users of group *[" + group_name + "]*: " +  named_users.join(", ")
            );
        }
    }

    OnUserRemove(args : string[], arg_pos : number) : void {
        let group_name = args[arg_pos + 1];
        let user_name  = args[arg_pos + 2];
        let user_id : string;
        
        let id = this.GetIdOfUser(args[arg_pos + 2]);

        if (id === undefined || id == null) {
            user_id = "";
        }
        else {
            user_id = id.id; 
        }

        this.CheckSplitSend(
            this.group_manager.RemoveUserFromGroup(group_name, user_id),
            "User *[" + user_name + "]* removed from group *[" + group_name + "]*",
            "User or group not found!!" 
        );
    }

    OnUserList(args : string[], arg_pos : number) : void {
        let group_name = args[arg_pos + 1];
        let all_users = <string[]>this.group_manager.ListUsersOfGroup(group_name);
        let named_users = new Array<string>();

        for (let i = 0; i < all_users.length; ++i) {
            let user_name = this.GetNameOfUser(all_users[i]);

            if(user_name === undefined || user_name == null) {
                continue;
            }

            named_users.push(user_name.name);
        }
        
        this.SendMessageToChannel(
            "Users in group *[" + group_name + "]*: " +  named_users.join(", ")
        );
    }
}