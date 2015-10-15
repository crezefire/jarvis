var groups = [];
var reminderID  = 0;
var reminders = [];

var group_api = function() {

  group_api.prototype.AddGroup = function(name) {
    name = name.toLowerCase();

    if(groups[name])
      return false;

    groups[name] = [];

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

  group_api.prototype.SetReminderForGroup = function(groupName, time, message) {
    if(!groups[groupName])
      return false;


  }
};

module.exports = group_api;