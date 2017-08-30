# Asynchronous-Directory-Manager
Mimic file/directory changes onto a relative remote server.

-------------------------------------------------------------------------------
### Description
- Problem: Lots of people enjoy using their text editors on their local pc's and it's a
bit of a hassle to manage files/directories on remote servers.
- Possible Solution: A Asynchronous Manager that watches the directory being
worked on and whenever any changes happens within that directory (and sub directories)
and applies those changes to a relative remote directory; in a sense mimics.
- Primary Audience: Rutgers Computer Science students, hence ilab.js  
- usage: node index.js --host <hostname of remote server> --remote <absolute path on remote server>

Options|Description|Status
--------|-----|----
host|host to copy files to|Done
remote|absolute directory on relative machine to save files to|Done
mute|remove all verbose output|Done
roe|restarts program on any error|Not Done
debug|prints all error statements|Done
