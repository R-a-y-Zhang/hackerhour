//       Third-Party Modules
//________________________________________
const ilab = require('./ilab.js')
const yargs = require('yargs');
var shell = require('shelljs');
const os = require('os');
const fs = require('fs');
var client = require('scp2');
var rn = require('random-number');
var Inotify = require('inotify').Inotify;
var inotify = new Inotify();
var exec = require('ssh-exec');
//_________________________________________

//            Global Variables
//_________________________________________
var watchedF = []; //Holds all files being watched
var watchFd = []; //Holds all the watching descriptors for each file
var watchedD = []; //Holds all directories being watched
var watchDd = [] //Holds all watching descriptors for each directory
var username = ''; //username corresponding to ssh session
var password = ''; //password corresponding to ssh session
var masterDir = ''; //Master directory that is to be watched
var host = ''; //host name of the remote server to sync files to
var dirRemote = ''; //absolute path to where the sync files to on the remote server
var scpN = 0;
var m = false; //mute option
var r = false; //restarting the program option.
var d = false; //debugging option
//_________________________________________



/*
   TO DO
___________

*/

/*
Function Name: callBackSCP
Function Type: Utility
Paramters:
  createdItem: A string that represents the item to be copied over
Description:
  This function is used when new files are created into watched directories,
  it secure copies the information over to the remote server.
Possible Errors:
  SSH Errors
  Permission error
*/
var callBackSCP = (createdItem)=>{
  var pathToRemote = dirRemote+''+createdItem.substring(masterDir.length,createdItem.length);
  console.log(pathToRemote);
  try{
    if(host === "ilab"){
      findSuitableILab(createdItem,pathToRemote);
    }
    else{
      scpN++;
      client.scp(createdItem,username+':'+password+'@'+host+':'+pathToRemote,function(err){
        if(err){
          console.log("There was an error when copying over the file: ",createdItem);
          if(d)
            console.error(err);
        }
        scpN--;
      });
    }
  }
  catch(e){
    console.log("Seems something was wrong when trying to copy, make sure all your arguments were correct!");
    if(d)
      console.error(e);
    process.exit(1);
  }
}


/*
Function Name: findSuitableILab
Function Type: Utility
Paramters:
  file: The file that is to be copied over
  pathTR: (path to remote server), where to copy file to
Description:
  If the user decides that they want to copy the files to an ilab machine they may
  have the host paramter of the script set to 'ilab', this function goes through
  a process of selecting an ilab machine from random from ilab.js and copying over
  the file using that ilab hostname.
Possible Errors:
  ilab machines are down for any reason, this function will never copy the file over.
  file does not have the correct permissions to be copied over
*/
function findSuitableILab(file,pathTR){
  roptions = {
    min: 0,
    max: 21,
    integer: true
  }
  var rand = rn(roptions);
  ilab.pingList[rand].send(function(err,ms){
    if(err){
      console.log(ilab.ilabMachines[rand]+' can not be reached at the moment, trying another machine.');
      findSuitableILab(file,pathTR)
    }
    else{
      scpN++;
      client.scp(file,username+':'+password+'@'+ilab.ilabMachines[rand]+':'+pathTR,function(err){
        if(err){
          console.log("There was an error when copying over the file: ",file);
          if(d)
            console.error(err);
        }
        scpN--;
        if(scpN === 0){
          if(!m)
            console.log("All copying is done, ok to exit!");
        }
      });
    }
  })
}

/*
Function Name: fileCallBack
Function Type: Callback
Paramters:
  event: an object that holds curcial information about the watched file like its
  watched file descriptor.
Description:
  This callback function fires when a file is modified. It goes through the process
  of finding the correct file to copy over and copying it over to the remote server.
Possible Errors:
  host does not exists
  permissions issues in regards to the file
*/
var fileCallBack = (event)=>{
  var mask = event.mask;
  if(mask & Inotify.IN_MODIFY){
    if(!m)
      console.log("A File was modified, copying contents over...");
    //secure copy the file that was modified
    for(var i = 0; i < watchFd.length; i++){
      if(event.watch === watchFd[i]){
          var pathToRemote = dirRemote+''+watchedF[i].substring(masterDir.length,watchedF[i].length);
          try{
            if(host === "ilab"){
              findSuitableILab(watchedF[i],pathToRemote);
            }
            else{
              scpN++;
              client.scp(watchedF[i],username+':'+password+'@'+host+':'+pathToRemote,function(err){
                if(err){
                  console.log("There was an error when copying over the file: ",watchedF[i]);
                  if(d)
                    console.error(err);
                }
                scpN--;
                if(scpN === 0){
                  if(!m)
                    console.log("All copying is done, ok to exit!");
                }
              });

            }
          }
          catch(e){
            console.log("Seems something was wrong when trying to copy, make sure all your arguments were correct!");
            if(d)
              console.error(e);
            process.exit(1);
          }
          return;
      }
    }
  }
}

/*
Function Name: dirCallBack
Function Type: Callback
Paramters:
  event: an object that holds curcial information about the watched directory like its
  watched file descriptor.
Description:
  This callback function fires when a directory is changed in the ways specfied in watch_for. Depending on what inotifty
  went off. If an item is created or moved into a watched directory, this function will automatically watch this item and
  copy it over to the remote server (copying empty directories is not a thing, make sure items are in directories before copying).
  The other thing that this function does is check for if items were deleted or moved out of a watched directory. This is where,
  admittedly most of the errors of this application will occur, the issue comes from when we delete items, these items could be directories
  with mutliple items inside it. This could have been solved by using some data structure, but for now I have decided to
  just re-watch all files and directories (which is very inefficient and it lacks compensation for asynchronous threads).
  A better alternative would be to use a data structure to hold the information for all items and a way to tell if an item
  is a directory. RANT OVER I SWEAR!
Possible Errors:
  When removing items with *, will ocassionally error because of sync/async imcompatibility
*/
var dirCallBack = (event) => {
  var mask = event.mask;
  wd = event.watch;
  if(!m)
    console.log("Directory Callback fired!");
  if((mask & Inotify.IN_CREATE) | (mask & Inotify.IN_MOVED_TO)){
    //Scenarios: new file created or new directory created, If a new directory
    //is created, make sure to watch all the content within it.
    var path = '';
    for(var i = 0; i < watchDd.length; i++){
      if(wd === watchDd[i]){
        path = watchedD[i];
      }
    }
    var createdItem = path+'/'+event.name;
    if(fs.statSync(createdItem).isDirectory()){
      //watch the new directory and automatically add it
      watchedD.push(createdItem);
      var newDirWatcher = {
        path: createdItem,
        watch_for: Inotify.IN_CREATE | Inotify.IN_DELETE | Inotify.IN_DELETE_SELF | Inotify.IN_MOVED_FROM | Inotify.IN_MOVED_TO,
        callback: dirCallBack
      };
      var newWD = inotify.addWatch(newDirWatcher);
      watchDd.push(newWD);
      recursiveWatch(createdItem,true);
    }
    else{
      //watch the new file and add it automatically
      watchedF.push(createdItem);
      var newFileWatcher = {
        path: createdItem,
        watch_for: Inotify.IN_MODIFY,
        callback: fileCallBack
      };
      var newWD = inotify.addWatch(newFileWatcher);
      watchFd.push(newWD);
      callBackSCP(createdItem);
    }
  }
  else if((mask & Inotify.IN_DELETE) | (mask & Inotify.IN_MOVED_FROM) | (mask & Inotify.IN_DELETE_SELF)){
    //Scenarios: file OR directory deleted, in the case that a directory is deleted you need to unwatch
    //all content within those directories
    if(!m)
      console.log("Item Deleted");
    var path = '';
    for(var i = 0; i < watchDd.length; i++){
      if(wd === watchDd[i]){
        path = watchedD[i];
      }
    }
    var deletedItem = path+'/'+event.name;
    if(d)
      console.log(deletedItem);
    var remoteToDelete = dirRemote+''+deletedItem.substring(masterDir.length,deletedItem.length);
    if(d)
      console.log(remoteToDelete);
    watchDd = [];
    watchedD = [];
    watchFd = [];
    watchedF = [];
    watchAll(masterDir,username,password,host,dirRemote,m,r,d);
    exec('rm -rf '+remoteToDelete,{
      user: username,
      host: "cd.cs.rutgers.edu",
      password: password
    });
  }
}






/*
Function Name: checkAccess
Function Type: Utility
Paramters:
  file: The file to be checked
Description:
  This function simply checks if the user has access to the file that is being specified.
Possible Errors:
  file cannot be accessed because of permission errors.
*/

var checkAccess = (file) => {
  fs.accessSync(file,fs.R_OK | fs.W_Ok)
}

/*
Function Name: watchAll
Function Type: Core
Paramters:
  md: The masterDir obtained from the current directory of the user
  user: username for ssh
  pass: password for ssh
  ht: host to use for copying over
  remote: absolute path on remote server to copy files to
Description:
  This function is the core function for this application, it first defines the global
  variables masterDir, username, password, host, and dirRemote. It then recursively reads
  the content of subdirectories and places a watch on all files within the masterDir. Each
  watch
Possible Errors:
  see checkAccess Errors
*/
var watchAll = (md,user,pass,ht,remote,mute,roe,debug) => {
  masterDir = md;
  username = user;
  password = pass;
  host = ht;
  dirRemote = remote;
  m = mute;
  r = roe;
  d = debug;
  if(dirRemote[dirRemote.length-1] === '/'){
    dirRemote = dirRemote.substring(0,dirRemote.length-1);
  }
  watchedD.push(masterDir);
  var newDirWatcher = {
    path: masterDir,
    watch_for: Inotify.IN_CREATE | Inotify.IN_DELETE | Inotify.IN_DELETE_SELF | Inotify.IN_MOVED_FROM | Inotify.IN_MOVED_TO,
    callback: dirCallBack
  };
  newWD = inotify.addWatch(newDirWatcher);
  watchDd.push(newWD);
  var currFiles = fs.readdirSync(masterDir);
  for(var i = 0; i < currFiles.length; i++){
    currFiles[i] = masterDir+'/'+currFiles[i];
    if(fs.statSync(currFiles[i]).isDirectory()){
      watchedD.push(currFiles[i]);
      var newDirWatcher = {
        path: currFiles[i],
        watch_for: Inotify.IN_CREATE | Inotify.IN_DELETE | Inotify.IN_DELETE_SELF | Inotify.IN_MOVED_FROM | Inotify.IN_MOVED_TO,
        callback: dirCallBack
      };
      newWD = inotify.addWatch(newDirWatcher);
      watchDd.push(newWD);
      recursiveWatch(currFiles[i],false);
      continue;
    }
    try{
      checkAccess(currFiles[i])
      watchedF.push(currFiles[i]);
      var newFileWatcher = {
        path: currFiles[i],
        watch_for: Inotify.IN_MODIFY,
        callback: fileCallBack
      }
      newWD = inotify.addWatch(newFileWatcher);
      watchFd.push(newWD);
    }
     catch(e){
       console.log("Permission denied for: "+currFiles[i]);
       console.log("Will not watch this file/directory.");
       console.log("If this file/directory should be watched, consider solving the permissions and running the refresh.")
       continue;
     }
  }

};

/*
Function Name: recursiveWatch
Function Type: Utility
Paramters:
  dir: The directory we are currently checking files for
Description:
  This function recursively adds a watcher to all subdirectories of the main directory.
  Watchers look for modified files.
Possible Errors:
  see checkAccess Errors
*/

var recursiveWatch = (dir,fromCallBack) => {
  if(d)
    console.log("Directory: ",dir)
  var newFiles = fs.readdirSync(dir);
  if(d)
    console.log(newFiles)
  for(var i = 0; i < newFiles.length; i++){
    newFiles[i] = dir+"/"+newFiles[i];
    if(fs.statSync(newFiles[i]).isDirectory()){
      watchedD.push(newFiles[i]);
      var newDirWatcher = {
        path: newFiles[i],
        watch_for: Inotify.IN_CREATE | Inotify.IN_DELETE | Inotify.IN_DELETE_SELF | Inotify.IN_MOVED_FROM | Inotify.IN_MOVED_TO,
        callback: dirCallBack
      };
      newWD = inotify.addWatch(newDirWatcher);
      watchDd.push(newWD);
      recursiveWatch(newFiles[i]);
      continue;
    }
    try{
      checkAccess(newFiles[i]);
      watchedF.push(newFiles[i]);
      var newFileWatcher = {
        path: newFiles[i],
        watch_for: Inotify.IN_MODIFY,
        callback: fileCallBack
      }
      newWD = inotify.addWatch(newFileWatcher);
      watchFd.push(newWD);
      if(fromCallBack){
        callBackSCP(newFiles[i]);
      }
    }
   catch(e){
     console.log("Permission denied for: "+newFiles[i]);
     console.log("Will not watch this file/directory.");
     console.log("If this file/directory should be watched, consider solving the permissions and running the refresh.")
     continue;
   }
  }
}





module.exports ={
  username,
  password,
  masterDir,
  watchAll,
  shell,
  yargs,
  watchedF,
  watchFd,
  scpN
};
