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
        this.current_pool.concat(new_users);
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
        let groupIndex = this.FindGroupByName(name);

        if (groupIndex >= 0) {
            return false;
        }

        this.groups.push(new Group(name));

        return true;
    }

    RemoveGroup(name : string) : boolean {
        let groupIndex = this.FindGroupByName(name);

        if (groupIndex < 0) {
            return false;
        }

        this.groups.splice(groupIndex, 1);

        return true;
    }

    RenameGroup(old_name : string, new_name : string) : boolean {
        let groupIndex = this.FindGroupByName(old_name);

        if (groupIndex < 0) {
            return false;
        }

        this.groups[groupIndex].Rename(new_name);

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
}