var fs = require('fs');

class Group {
    private users : string[];
    private current_pool : string[];
    private name : string;

    constructor(_name : string) {
        this.users = new Array<string>();
        this.current_pool = new Array<string>();
        this.name = _name; 
    }

    Name() : string {
        return this.name;
    }

    Rename(new_name : string ) : void {
        this.name = new_name;
    }

    ClearUserPool() : void {
        this.current_pool.length = 0;
    }

    AddUsers(new_users : string[]) {
        for (let user of new_users) {
            if (this.users.indexOf(user) >= 0) {
                continue;
            }

            this.users.push(user);
            this.current_pool.push(user);   
        }
    }

    RemoveUser(user_name: string) : boolean {
        let user_index = this.users.indexOf(user_name);

        if (user_index < 0) {
            return false;
        }

        this.users.splice(user_index, 1);

        return true;
    }

    GetUsers() : string[] {
        return this.users;
    }
}

export class GroupManager {

    private groups : Group[];

    constructor() {
        this.groups = new Array<Group>();
    }

    private FindGroupByName(name : string) : number {
        for (let i = 0; i < this.groups.length; ++i) {
            if (this.groups[i].Name() == name) {
                return i;
            }
        }

        return -1;
    }

    CreateGroup(name : string) : boolean {
        let group_index = this.FindGroupByName(name);

        if (group_index >= 0) {
            return false;
        }

        this.groups.push(new Group(name));

        return true;
    }

    RemoveGroup(name : string) : boolean {
        let group_index = this.FindGroupByName(name);

        if (group_index < 0) {
            return false;
        }

        this.groups.splice(group_index, 1);

        return true;
    }

    RenameGroup(old_name : string, new_name : string) : boolean {
        let group_index = this.FindGroupByName(old_name);

        if (group_index < 0) {
            return false;
        }

        this.groups[group_index].Rename(new_name);

        return true;
    }

    GetAllGroups() : string[] {
        let groupNames = new Array<string>();

        for (let group of this.groups) {
            groupNames.push(group.Name());
        }

        return groupNames;
    }

    SaveGroupsToFile(file_name : string) : void {
        fs.writeFile(
            file_name + ".groups.json",
            JSON.stringify(this.groups),
            null
        );
    }

    LoadGroupsFromFile(file_name : string) : boolean {
        let file_data : string;
        
        try {
          file_data = fs.readFileSync(file_name + ".groups.json");
        }
        catch(exception) {
            return false;
        }

        if (file_data.length <= 0) {
            return false;
        }

        let group_data = JSON.parse(file_data);

        this.groups.length = 0;

        for (let group of group_data) {
            let temp = new Group(group['name']);
            this.groups.push(temp);
            temp.AddUsers(group['users']);
        }

        return true;
    }

    AddUsersToGroup(group_name : string, users : string[]) : boolean {
        let group_index = this.FindGroupByName(group_name);

        if (group_index < 0) {
            return false;
        }

        this.groups[group_index].AddUsers(users);

        return true;
    }

    ListUsersOfGroup(group_name : string) : string[] | null {
        let group_index = this.FindGroupByName(group_name);

        if (group_index < 0) {
            return null;
        }

        return this.groups[group_index].GetUsers();
    }

    RemoveUserFromGroup(group_name : string, user_name : string) : boolean {
        let group_index = this.FindGroupByName(group_name);

        if (group_index < 0) {
            return false;
        }

        return this.groups[group_index].RemoveUser(user_name);
    }
}