var groups = [];
var reminderID  = 0;
var reminders = [];

var group_api = function() {
  
  group_api.prototype.removeItem = function (key) {
   if (!this.hasOwnProperty(key))
      return;
   if (isNaN(parseInt(key)) || !(this instanceof Array))
      delete this[key];
   else
      this.splice(key, 1);
  }

  group_api.prototype.AddGroup = function(name) {
    name = name.toLowerCase();

    if(groups[name])
      return false;

    groups[name] = [];

    return true;
  }
  
  group_api.prototype.RemoveGroup = function(name) {
    if(!groups[name])
      return false;
      
    if (!groups.hasOwnProperty(name))
      return;
    if (isNaN(parseInt(name)) || !(groups instanceof Array))
      delete groups[name];
    else
      groups.splice(name, 1);
     
    return true;
  }
  
  group_api.prototype.RenameGroup = function(oldName, newName) {
    if(!groups[oldName])
      return false;
 
    var temp = groups[oldName];
    
    if (!groups.hasOwnProperty(oldName))
      return;
    if (isNaN(parseInt(oldName)) || !(groups instanceof Array))
      delete groups[oldName];
    else
      groups.splice(oldName, 1);
    
    groups[newName] = temp;
    
    return true;
  }

  group_api.prototype.AddUserToGroup = function(users, groupName) {
    groupName = groupName.toLowerCase();

    if(!groups[groupName])
      return false;
    
    if(!Array.isArray(users))
    {
      if(groups[groupName].indexOf(users) < 0) {
        groups[groupName].push(users);
        return true;
      }
      
      return false;
    }

    for(i in users) {
      if(groups[groupName].indexOf(users[i]) < 0)
        groups[groupName].push(users[i]);
    }

    return true;
  }
  
  group_api.prototype.RemoveUserFromGroup = function(users, groupName) {
    if(!groups[groupName])
      return false;
      
    var currentGroup = groups[groupName];
      
    for (var i in users) {
      var index = currentGroup.indexOf(users[i]); 
      if(index >= 0) {
        delete currentGroup[index];
      }
    }
    
    return true;
  }

  group_api.prototype.GroupList = function() {
    var arr = new String();

    for(i in groups) {
      arr += i;
      arr += ", ";
    }

    if(arr.length != 0)
      return arr;
    else
      return null;
  }

  group_api.prototype.GetUsersOfGroup = function(groupName, slackClient) {
    if(!groups[groupName])
      return null;

    var arr = new String();

    for(i in groups[groupName]) {
      arr += slackClient.getUserByID(groups[groupName][i]).name;
      arr += ", ";
    }

    if(arr.length != 0)
      return arr;
    else
      return null;
  }
  
  group_api.prototype.SelectBuddy = function(groupName, userName) {
    if(!groups[groupName])
      return false;
      
      var asdf = groups[groupName];
    
    //check if pool exists
    if(!groups[groupName]["pool"])
      groups[groupName]["pool"] = [];
    
    return true;
  }

  group_api.prototype.SetReminderForGroup = function(groupName, time, message) {
    if(!groups[groupName])
      return false;


  }
};

module.exports = group_api;