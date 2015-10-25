var groups = [];
var pools = [];
var reminderID  = 0;
var reminders = [];

var fs = require('fs');

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
    pools[name] = [];

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
    
    delete groups[oldName];
    groups.splice(oldName, 1);
    
    groups[newName] = temp;
    pools[newName] = pools[oldName];
    
    delete pools[oldName];
    pools.splice(oldName, 1);
    
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
        pools[groupName].push(users[i]);
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
        currentGroup.splice(index, 1);
        
        RemoveFromPool(pools[groupName], users[i]);
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
  
  function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
  }
  
  function RemoveFromPool (pool, user) {
    var index = pool.indexOf(user);
    if(index >= 0) {
      delete pool[index];
      pool.splice(index, 1);
    }
  }
  
  function createSubPool(groupName, userName) {
    var users = [];
    for(var i in pools[groupName]) {
      if(pools[groupName][i] != userName)
        users.push(pools[groupName][i]);
    }
    
    if(users.length <= 0) {
      var currentGroup = groups[groupName];
      for(var i in currentGroup) {
        pools[groupName].push(currentGroup[i]);
      }
      
      return createSubPool(groupName, userName);
    }
    
    return users;
  }
  
  function SelectBuddyFromPoolAndRemove(groupName, userName, channel, slackClient) {
    var currentPool = createSubPool(groupName, userName);
    
    var index = randomInt(0, currentPool.length);
    
    index = pools[groupName].indexOf(currentPool[index]);
    var toRemove = pools[groupName][index];
    
    var userName = slackClient.getUserByID(toRemove).name.toString();
    userName = "@" + userName;
    
    for(var i in pools) {
      RemoveFromPool(pools[i], toRemove);
    }
    
    channel.send("Buddy time: " + userName);
  }
  
  group_api.prototype.SelectBuddy = function(groupName, userName, channel, slackClient) {
    if(!groups[groupName])
      return false;
      
    var currentGroup = groups[groupName];
    
    if(currentGroup.length == 0) {
      channel.send(">No users in group: " + groupName);
      return true;
    }
    
    if(currentGroup.length == 1) {
      channel.send(">You are your own buddy!!");
      return true;
    }
    
    SelectBuddyFromPoolAndRemove(groupName, userName, channel, slackClient);
      
    //refill pool if empty
    if(pools[groupName].length <= 0) {
      for(var i in currentGroup) {
        pools[groupName].push(currentGroup[i]);
      }
    }
      
    return true;
  }
  
  function SendMessageToUser(user, message, slackClient) {
    var userName = slackClient.getUserByID(user).name;
    
    var dmChannel = slackClient.getDMByName(userName);
    
    if(dmChannel)
      dmChannel.send(message);
  }
  
  group_api.prototype.SendMessage = function(groupName, user, message, slackClient) {
    if(!groups[groupName]) {
      return false;
    }
    
    var userName = slackClient.getUserByID(user).name;
    
    var text = "*" + groupName + "* (" + userName + "): >" + message + "<";
    
    for(var i in groups[groupName]) {
      SendMessageToUser(groups[groupName][i], text, slackClient);
    }
    
    return true;
  }

  group_api.prototype.SetReminderForGroup = function(groupName, time, message) {
    if(!groups[groupName])
      return false;
  }
  
  group_api.prototype.SaveGroupsToFile = function(fileName) {
      var file = fs.createWriteStream(fileName + ".groups");
                                  
      var fileBuffer = {};
      
      for(var i in groups) {
        fileBuffer[i] = groups[i];
      }
      
      file.write(JSON.stringify(fileBuffer));
      file.end();
  }
  
  group_api.prototype.LoadGroupsFromFile = function(fileName) {
    var x;
    try {
      x = fs.readFileSync(fileName + ".groups", 'utf8');
    }
    catch(exception) {
      return false;
    }
    
    var obj = JSON.parse(x);
    
    for(var i in obj) {
      this.AddGroup(i);      
      this.AddUserToGroup(obj[i], i);
    }
    
    return true;
  }
};

module.exports = group_api;