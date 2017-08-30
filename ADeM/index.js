const et = require('./easy_t.js');
masterDir = et.shell.pwd().stdout
et.masterDir = masterDir
var argv = et.yargs.argv
var prompt = require('prompt');

/*
   TO DO
___________
1. New files and new directories
2. Check about file renames.
3. Creating a file and Removing
File removed -> Signal Obtained -> look through contents of watched
directory and compare the sub-set, starting with the index where that
directory begins its files to where it ends -> Find the difference ->
removed the file from watchedF and then remove the file from watchFd ->
stop watching the file there -> remove the file on the remote server


File created -> Signal Obtained -> look through contents of watched
directory and the sub-set, starting with the index where that
directory's files begin to where ti ends, find the new file -> add the new
file in the correct place! So you need to see where the new file shows up,
inbetween what two files, that is where it goes -> scp the new file on the
remote server.
*/

if(argv.help){
  console.log("Here are the following options and their Priority (1 = mandatory, 0 = optional)");
  console.log("Options         Description                   Priority");
  console.log("_______      ___________________              _________");
  console.log("--host       host to copy files to               1");
  console.log("--remote      ABSOLUTE directory                 1");
  console.log("              on host machine to");
  console.log("                save files to.");
  console.log("--mute        remove all verbose output          0");
  console.log("--roe         restarts the program on            0");
  console.log("                    ANY error");
  console.log("--debug       print all error statements         0");
  console.log("                  when they occur.")
  process.exit(0);
}


if(!argv.remote | !argv.host){
  console.log("There seems to be some important missing parameters.");
  console.log("usage:")
  console.log("node index.js --host <hostname of remote server> --remote \"<absolute path on remote server>\"");
  console.log("If you are using the ilab machines type in ilab for the host argument.");
  console.log("You can also try the --help command for more options!");
  process.exit(0);
}
 var schema = {
   properties: {
     username:{},
     password: {
       hidden: true
     }
   }
 };
process.on('SIGINT', () =>{
  console.log('\nPlease wait until all copies are finished...');
  while(et.ecpN > 0){
    continue;
  }
  console.log('Finished copying!');
  process.exit(0);
});
var mute = false;
var roe = false;
var debug = false;
if(argv.mute){
  mute = true;
}
if(argv.roe){
  roe = true;
}
if(argv.debug){
  debug = true;
}
prompt.start();
prompt.get(schema, (err, result) => {
  et.watchAll(masterDir,
              result.username,
              result.password,
              argv.host,
              argv.remote,
              mute, roe, debug);
});
