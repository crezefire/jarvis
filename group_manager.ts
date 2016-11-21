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

    GetAllGroups() : string[] {
        let groupNames = new Array<string>();

        for (let group of this.groups) {
            groupNames.push(group.Name());
        }

        return groupNames;
    }
}