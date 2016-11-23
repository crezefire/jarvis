import * as Groups from "./group_manager"
import * as RNG from "./rng"

export class CallbackHandler {
    private slack_rtm : any;
    private current_message : any;
    private group_manager : Groups.GroupManager;
    private random_number : RNG.RNG;
    private PRE_FORMAT : string = ">";
    
    constructor(_slack_rtm : any) {
        this.slack_rtm =  _slack_rtm;
        this.current_message = null;
        this.group_manager = new Groups.GroupManager();
        let date = new Date();
        this.random_number = new RNG.RNG(date.getTime());
    }

    private SendMessageToChannel(message : string) : void {
        this.slack_rtm.sendMessage(this.PRE_FORMAT + message, this.current_message.channel);
    }

    private SendIsTypingMessageToChannel(channel : string) : void {
        this.slack_rtm.sendTyping(channel);
    }

    //TODO(vim): Make type safe
    private GetNameOfUser(id : string) : any {
        return this.slack_rtm.dataStore.getUserById(id);
    }

    //TODO(vim): Make type safe
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

    private GetSubPool(current_pool : string[]) : string[] {
        let sub_pool = new Array<string>();
        let user_id : string = this.current_message.user; 

        for (let user of current_pool) {
            if (user_id == user)
                continue;
            
            let user_data = this.GetNameOfUser(user);

            if (user_data.presence == "active") {
                sub_pool.push(user);
            }
        }

        return sub_pool;
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

        if (all_users == null) {
            this.SendMessageToChannel("Cannot find group *[" + group_name + "]*");
            return;
        }

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

    private CheckSubPool(current_pool : string[], current_group : string[], group_name : string) : string[] | null {
        let sub_pool = this.GetSubPool(current_pool);

        if (sub_pool.length == 0) {

            if (current_pool.length == current_group.length) {
                this.SendMessageToChannel("No users of group *[" + group_name + "]* are online!");
                return null;
            }
            else {
                this.group_manager.RefreshPool(group_name);
                return this.CheckSubPool(current_group, current_group, group_name);
            }
        }

        return sub_pool;
    }

    OnPickBuddy(args : string[], arg_pos : number) : void {
        let group_name = args[arg_pos + 1];

        let current_groups = <string[]>this.group_manager.ListUsersOfGroup(group_name);
        let pool = this.group_manager.GetPoolFromGroup(group_name);
        let current_pool = <string[]>(pool);

        if (current_pool == null) {
            this.SendMessageToChannel("Group *[" + group_name + "]* not found!");
            
            return;
            //TODO(vim): Did you mean ....this group.....
        }

        if (current_groups.length == 0) {
            this.SendMessageToChannel("No users in group *[" + group_name + "]*");

            return;
        }

        if (current_groups.length == 1) {

            if(current_groups[0] == this.current_message.user.toUpperCase()) {
                this.SendMessageToChannel("You are your own buddy!");
            }
            else {
                this.SendMessageToChannel("Buddy kicked: @" + this.GetNameOfUser(current_pool[0]).name);
            }

            this.group_manager.RemoveUserFromPools(current_pool[0]);
            return;
        }

        let valid_pool  = this.CheckSubPool(current_pool, current_groups, group_name);
        let sub_pool = <string[]>valid_pool;

        if (sub_pool == null) {
            return;
        }

        let current_user =  sub_pool [ this.random_number.nextInt(0, sub_pool.length) ];
        
        this.group_manager.RemoveUserFromPools(current_user);

        this.SendMessageToChannel("Buddy kicked: @" + this.GetNameOfUser(current_user).name);
    }
}