# Terminal Talk For Hacker Hour
## Introduction
Hello, this a on overview of the talk titled "How to Terminal". The following
will cover the commands that I will cover and also things that I had hope to
cover and did not get to. I hope you enjoy! Or, most likely, you'll be bored
out of you mind. Let's begin!

## Basics
### Why
As a programmer, there are a few tools which you are required to be
comfortable with whether or not you want to or not. One of these things is the
terminal, the tool which our forefathers wielded before we had cute little icons
and nice colors to look at. A time when speeds were measured in KHz instead of
GHz. A time when pong was considered fun. Some might find it intimidating,
some might find it annoying to use (I mean, why would you when there are other
tools that does everything that the terminal does but with a GUI),
 and some might even embrace it. However you feel about it,
you will need to be comfortable with it because at some point, you will be called
upon to use it. Whether it be your primary interface when you work or if one day
your machine suddenly fails to boot and you are cheerily greeted with the message "Welcome to emergency mode!",
because your file system is fsck'd and your windowing system has dropped off the Earth.
This talk will cover the vanilla terminal in POSIX-compliant machines and will not include any commands that are not
included in the vanilla versions (I hope). Windows will not be covered because
we are not barbarians (there are windows equivalents, and if you are running windows
you can ssh into an ilab machine, which can be set up in minutes just ask anyone who has taken cs 211 or above,
or if you have the Anniversary Windows 10 update there should
be a bash available to you). We will also go over some packages that you
should install to make your life much easier. Now, let us get started.
### Syntax for this guide
- Text not surrounded with anything denote that the text must be there
- Text surrounded by brackets indicate parameters that must be supplied
- Text surrounded by angle brackets indicate parameters that are optional
- Text surrounded by brackets or angle brackets that are appended with an "\*" means
    there can be zero or more arguments. Those with a "+" means that there must
    be at least one of such argument.

### Absolute and Relative Paths
Any file on a file system can be located based on either an absolute path or
a relative path. An absolute path means the path to a file from the root of the
file system (i.e. /) and is of the form: /dir1/dir2/dir3/...
A relative path on the file system is the location of the file relative to your current
location. So for example, let us say that there is the following directory
and subdirectories:
- dir
    - dir1
        - file1
        - file2
    - dir2

And let us say you are located in dir2. To access file1 in dir1, the relative
path would be: ../dir1/file1 OR ./../dir1/file1. If you are in dir1, to reference file1 you can
either do: file1 OR ./file1. This also introduces two very important path operators: . AND .. .
The single dot is used to reference the current directory, and the double dot is used
to reference the parent directory, or the directory right above your current directory in
the hierarchy. These are very useful for relative pathing.

### File System Navigation
One of the most common tasks is navigating the file system. The following list
are some of the most common commands used to interface with the file system.

**pwd** : Shows your current working directory's absolute path

**ls (options) (path)** : List files in a directory
    + options
        + -a : List all files
        + -l : List files in list form (columns) instead of simplified form (rows)
    + path : path of the directory
    + Sample commands:
        + ```ls``` : list all files with just their names, except hidden ones
        + ```ls -a``` : list all files with just their names, including hidden ones
        + ```ls -al``` : list all files and the details about those files in list format
        + ```ls ./dir``` : list all files, except hidden files, in the "dir" subdirectory

**mkdir (-p) [new-directory-path]+** : makes a new directory or directories
    + -p : if given a path, such as dir1/dir2/dir3, it creates all directories down to
            the last directory, in the example, it creates dir1 in the current directory,
            then dir2 in dir1, then dir3 in dir2

**touch [files]+** : creates a file or files
    + Sample commands:
        + ```touch text.txt``` : creates a file called text.txt
        + ```touch dir1/text.txt``` : creates a file text.txt in dir1
        + ```touch text.txt text2.txt``` : creates the files text.txt and text2.txt

**rm (-r) (-f) [paths]+** :  remove files and directories
    + -r : removes directories and files. If you are only specifying files in paths, you do
            not require this option. However, if there are directories in the paths supplied,
            this option is required as rm will refuse to remove those directories and their
            contents.
    + -f : do not prompt for removal confirmation when removing files or directories, assume
            that you want to delete everything you specified

**cp (-r) [srcs]+ [dst]** : copy files or directories specified in srcs to dst directory.
    + -r : recursively copy directories and their contents to dst. Required for directories.

**mv [srcs]+ [dst]** : moves files or directories specified in srcs to dst directory

**find [patterns]+** : finds files whose path matches patterns
    + Sample commands:
        + ```find text.txt``` : find files in current directory whose name matches text.txt
        + ```find t*``` : find files whose first letter is t
        + ```find dir1/text.txt``` : find files in dir1 subdirectory whose name matches text.txt
        + ```find t* s*``` : find files whose first letter is t or s

**echo (string) (>|>>) (file)** : print contents in string to standard output or writes it to a file
    + ">" : replaces contents in _file_ with _string_
    + ">>" : appends _string_ to _file_
    + Usage of > or >> MUST include a file to write to

**less [file]** : outputs the contents of _file_ to terminal and allows navigation up and down

**head (-_num_) [file]** : outputs the first _num_ lines of _file_ (defaults to 10)

**tail (-_num_) [file]** : outputs the last _num_ lines of _file_ (defailts to 10)

**cat [files]+ (>|>>) (dst)** : combines the contents of _files_ and prints it to terminal or write it to file _dst_

Editing files can also be done in the terminal (oftentimes better than using an editor or IDE if you can
believe it), as all terminals are usually equipped with some type of editor, whether it be **ed**, **nano**, or **vi**/**vim**

### File Permissions, Ownership, Groups, and All Those Goodies
You think we are done with files? lmao. I did not even scratch the tip of the iceberg, I've only scratched the
precipitation on the tip of the iceberg. If you type ```ls -al```, you are presented with a bunch of strings and numbers
that you might not be able to make sense of. It should look something like this:
```
total 16
drwxr-xr-x  2 horimori horimori 4096 Aug 28 23:37 .
drwxr-xr-x 14 horimori horimori 4096 Aug 28 20:29 ..
-rw-r--r--  1 horimori horimori 6595 Aug 28 23:37 talk.md
.
.
.
```
This will be a good introduction to hard links and soft links (symbolic links, or symlinks), permissions, and groups, as well as how to modify 
permissions, groups, and making soft links.

Starting from left to right:
1. The letters on the left
    1. The first letter denotes whether the item is a directory (d), a symlink (l), or a file (-). If it is a ```d``` or ```-```, it is also
        a hard link while if it is a ```l```, it is a symlink.
    2. Then, you have 9 characters, each of which can be r, w, x, or -. These 9 characters represent the permissions for the file, divided by
        user permissions (the first 3 letters), group permissions (the second trio), the global permissions (the last 3 letters). The first
        letter of the group of three means whether the file can be read by the persons indicated (user, group, or global), the second denotes
        whether the file can be written to by the persons, and the last represents whether it can be executed. If read (r), write (w), or
        execute (x) permissions are granted, then the letter will appear in that place and if it is not, then - is placed there.
    3. Examples:
        + ```-rw-r--r--``` : the item is a file (the first -), the use can read and write but not execute the file (the first 3 letters after the first, rw-),
                        the group can read only (the next 3 characters, r--), and everyone (global) can read only (the last 3 characters, r--).
    4. Now, the user is the one who owns the file, the group is the group that the user belongs to (to see what groups you belong to, you can execute
        ```groups $USER``` and to see who you currently are, you can execute ```whoami``` or ```echo $USER```), and global is everyone who is not the user
        or the users in the group that the user belongs to.
    5. **chmod** : To add or remove permissions for the file, you would use _chmod_.
        1. Sample commands
            + ```chmod +x file``` : Allow user, group, and global to execute the file
            + ```chmod u+x file``` : Add execute permission for user to file
            + ```chmod g-x file``` : Remove execution permission from group for file
            + ```chmod w-w file``` : Remove write permissions for global for file
            + ```chmod ug+r file``` : Add read permission for user and group for file
        2. You can also use numerical codes to edit the permissions for the file. To change permissions using numeric codes, the numeric code must be
            exactly 3 numbers long (e.g. 123) and the numbers are determined by the binary representations of the permissions, i.e. if a permission
            is allowed, it holds the value of 1 and if it is not, it holds the value of 0. Therefore, if the permission is r-x, the binary would be
            101, or in decimal format, it would be 5. Therefore, if one wants to change a file's permission to rw-rw-rw, then you would execute the
            command: ```chmod 666 file```.
        3. **chown** : To change the owner and/or group of a file or directory, you would use the command _chown_.
            To change the user, to say user1, one would execute ```chown user1 file```. To change user and group, to user1 and group1,
            it would be ```chown user1:group1 file```. If you wish to recursively change ownership for a directory, you can execute
            ```chown -R user1 dir1``` or ```chown --recursive user1 dir1```.
2. This is the number of hard links to the file. If the item is a file, it is set to 1. If it is a directory, it is set to the number of
    subdirectories and files plus the parent directory.
3. The owner of the file.
4. The group the owner belongs to.
5. The size of the file in bytes.
6. The month of last modification.
7. The day of last modification.
9. The time of last modification.
10. The name of the file or directory.

### Zip, Bzip2, Gzip, and Tar
One of the most common formats that you will encounter are compressed and archive files. The most common of these files are zip (.zip),
bzip2 (.bz or .bz2), gzip (.gz), and tarball (.tar). The last one is a bit different from the other ones but that distinction can be saved for
you to figure out with Google.

#### Compressing to zip and making tarballs (as well as extracting them)
To make a zip file, you simply use **zip** like so: ```zip [zip file name].zip [files or directories]``` and it will compress the files to into a zip. If you have directories, use the
"-r" option. To unzip, you would use **unzip** and execute ```unzip [zipfile]``` and it will unzip it to the current directory. To unzip to another directory, set a destination
with "-d", e.g. ```unzip [zipfile] -d [dst]```

To create a tarball, you would use **tar** and execute ```tar -cvf [tarball name].tar [files or directories]``` and to extract one you would do
```tar -xvf [tarball name] (-C [target-directory])```. Sometimes, you will see a ".gz" somewhere in the tarball extension (e.g. tarball.tar.gz), meaning
that the files were compressed with gzip. Then, you would add a "z" to "-xvf" (so "-xvzf") to extract it. The letters, in the options mean the following:
+ "-c" means compress and "-x" means extract (easy way to remember: you **C**ompress a file and you e**X**tract a tarball)
+ "-v" means verbose mode, which shows you every file that it has unarchived. You do not need this if you do not want the vomit of text to appear on your screen.
+ "-f" means the file to read or write from
+ "-z" the tarball uses gzip for compression. Do not use if ".gz" is not in the extension. If it uses bzip2, use "-j" instead.

There are various tools out there to extract and compile all the different compression and archive formats, but these are the ones I usually use.

### Space Usage
**df (-h)** : Shows the disk space and usage of all currently mounted file systems. Add "-h" to make output human-readable.

**du (-h) [directory]** : Shows the disk usage of everyting in _directory_. Add "-h" to make output human-readable. You can also add "| sort -n" to
                        sort files by size (this is called piping and will be covered in the next section).

### Piping
One of the things you can do is use the output in one command and use it the argument in another. This is accomplished through the pipe ("|") character, with
the output of the command on the left of the pipe character as the input of the command to the right of the pipe character. This also allows the
introduction of the **grep** command, which can be used to find a pattern in an output piped to it. For example, you can do ```ls | grep text``` to find a file
or directory called text in the output of the ls command. This is the same as ```find text```.

## A Bit Harder Now
### Ports, Processes, Oh My!
Now we are done with the boring stuff, we can get into some more "interesting" stuff (though, "interesting" is a relative term). Everything
that runs in a computer, whether it be the code that draws things to terminal or the thing that makes the webcam turn on, is a "process".
A computer can have any number of processes, some just a few, others may have thousands. To distinguish these, each process is given a PID or
Process ID. PIDs are all positive numbers, almost always greater than 0, (PID 0 is reserved for paging processes and are not part of user-space). Processes
are usually granted on a sequential basis, i.e. the process that comes first gets a lower PID. PID 1 is granted to the _init_ process, responsible for
system startup and shutdown, but this is because it is almost always the first process that is run on a system. This PID is important because
this is what you need to _kill_ or terminate (I mean killing a process...I do not advocate murder). There may be a number of reasons that you
want to _kill_ a process. Whether the process is taking up too space or it has stopped responding and cannot be closed normally. We will get to how to kill
a process later. Now, we must figure out how to find the PID of the process we want to kill.

There are a few ways to find our process and its PID. I shall go over ps, top, and lsof.

**ps** -
The ps utility presents a snapshot of the currently running processes on the machine currently running processes on the machine.
There are a number of arguments that can be passed: a, u, and x. -a displays information about processes by other users including
those by the current user that also has a controlling terminal. -u displays info about processes by the specified user that has
a controlling terminal. -x displays information about processes that do not have a controlling terminal. If you are looking for a
process ran from the terminal, then it is not necessary to include -x. However, if it is something executed outside of a terminal,
such as another program, then it would be necessary to include -x. The output of ps might be a garbled mess, you might need to
pipe it to grep to search for a specific process (e.g. ```ps -aux | grep Chrome``` to search for an unresponsive Chrome process).

**top** -
This gives a real-time overview of the processes and the resources which it takes up. This gives information about a process's PID, virtual memory,
physical memory, cpu usage, and other information. This is useful if you find yourself low on memory and need to kill off a process that
is using too much (Chrome). You can sort the processes by the various categories at the top by append "-o" and the column name. However, top is meant
to show you the processes that are utilizing the most amount of resources and therefore lacks the ability to browse. If you want that ability,
you can install htop (please refer to instructions for your specific platform), which is more versatile than top and arguably more
readable.

**lsof** -
This lists files and the processes that own them as well as any ports and IPs that the file is listening on. While it is called
"list open files", literally everything in a Linux machine is a file (even network connections because they are given a number
called a "file descriptor"). Therefore, lsof can be used to diagnose networking issues. This can be used to see what process
is connecting on what port, and is especially useful for when you are trying to use a web framework and finds that the port that
you are trying to connect to is already in use. To do this, executing ```lsof -i -P -n | grep [port]``` will yield the process currently
operating on that port. However, you can also use this to figure out what process is currently using what file, which might become
necessary when you try to access a file and find that it is locked, by running ```lsof [file path]```.

### The Extras
Finally, before we proceed onto bash scripting, we cover two useful commands: _awk_ and _xargs_. The former is actually quite
complicated onto itself, and I'll simply go over a tiny slice of it, and the last one is actually pretty simple. Let us start with awk.

#### awk
**awk** in and of itself is a language, complete with variables, loops, conditionals, etc. However, it is not necessary to know the entirety of _awk_
in order  to use it. Oftentimes, outputs in terminal are in a table form, such as ```ls -al``` or ```ps aux``` and oftentimes, you only need a few
columns from the output and the others are superfluous and could even get in the way. So let us take the output of of ```ls -al``` and let us say
you only care about who each file belongs to. You can pipe the output of ```ls -al``` to  _awk_ and have it just print out the 2nd and last column.
Columns in awk are numbered starting from 1 (-_-) and columns can be accessed by $[column number]. _print_ is the command for outputting to standard
out. Therefore, the full command would be ```ls -al | awk '{ print $3 "\t" $9 }'```. You can also incorporate regex into awk, to filter out the results.
Let us say you only care about the hidden files, i.e. those starting with a period, then you would do ```ls -al | awk '$9 ~ /^\./'```. If you only wanted
the user, filename, and size of the files that begin with "a", then it would be ```ls -al | awk '{ if ($9 ~ /^a/) { print $3 "\t" $5 "\t" $9 } }'```.
This also happens to introduce one of the conditionals of _awk_.

#### xargs
**xargs** is used to pass deliminated results as individual parameters. For example, let us say that you have the files test1, test2, test3, test4, test5 and
you wish to delete all of them. Instead of typing out the filenames of those five, it would be more efficient to do ```find test* | xargs rm```. Here,
the results of _ls_ is piped to _grep_, which finds only those that start with test, and then passes the output to _xargs_, which uses each of those files
as an individual argument that is passed to _rm_.

#### ssh, scp, and rsync
Not really "extra" but more of "you need this for class". **ssh**, or Secure Shell, is used to securely log in to a remote machine (ilab or otherwise)
and be able to do work on said machine. This is necessary for various things, not just for verifying that your code runs on an ilab. The basic
syntax is: ssh <username>@<machine-name>. Then, it will likely prompt you for login information, after which you'll be granted access to the
remote machine.

**scp**, or Secure Copy, is used to transfer files to and from local and remote machines using the ssh protocol. It is pretty simple. It will take
a src as its first parameter and a destination as its second. An argument of _-r_ is necessary for transferring folders.
Syntax: `scp (-r) [src] [dst]`. Remote machines paths is specified by the following combination: <username>@<machine-name>:<absolute-path>.
rsync is a tool similar to, but meant to be superior to scp, since it uses delta-encoding and various methods to reduce network usage. The
syntax is the same for rsync and scp.

### Editors
There are a variety of tools for editing files built-in to terminal. Among those are ed, nano, pico, and vi. The other three are pretty easy to use,
you navigate with your arrow keys and at the bottom it will tell you the shortcuts to various commands. vi, on the other hand, does not do this.
I will briefly go over vi, and what to do. If you use vim, it is built to be a better version of vi (Vi Improved). There are three primary modes:
Normal, Visual, and Insert. Normal mode is used for navigation and text manipulation, Visual mode is used for manipulation of selected text,
and Insert mode is used for adding new text. Navigation is primarily done on the h (go left), j (go down), k (go up), and l (go right). You can go
from Normal --> Visual, Normal --> Insert, Insert --> Normal, and Visual --> Normal. To enter Visual mode, you press `v` while in Normal mode. To
enter Insert from Normal, you press `i`, and in any mode, you can return to Normal by using either `esc` or `Ctrl`+`[`. In normal mode, there are a
few useful navigation shortcuts. To move among the text hjkl can be used. Else, refer to the following.
- `:w` : Write buffer to file
- `:q` : Quit vim
- `:wq` : Write buffer and quit
- `:q!` : Force quit
- `Shift`+`g` : To end of file
- `gg : To start of file
- [number] + `Shift` + `g` : To to line [number]
- `dd` : cuts current line
- `p` : cuts current line
- `0` : Go to start of current line
- `$` : Go to end of current line
- `e` : Go to end of next word in current line
- `w` : Go to start of next word in current line
- `b` : Go to start of previous word in current line
- `/` + <word> : Search for all instances of <word> in current file
- `:s/<old-pattern>/<new-pattern>` : Finds and replaces first instance of old-pattern with new pattern
- `:s/<old-pattern>/<new-pattern>/g` : Replaces all on current line
- `:%s/<old-pattern>/<new-pattern>/g` : Replace all occurrances in file
- `:noh` : Remove highlighting
- `u` : Undo
- `Ctrl` + `r` : Redo

In visual mode, there are a few basic operations you can perform:
- Highlight: Enter visual mode at one end of the text you wish to select and navigate to the other end of what you wish to select
- Copy: After highlighting, press `y` (Yank)
- Cut: After highlighting, press 'd'

## Suggested Packages
- **git** - Interfaces with git. Pretty much essential.

- **tmux** - **T**erminal **MU**tiple**X**er, able to start multiple terminal sessions in a single terminal session and can help massively improve workflow.

- **htop** - Better version of top. Allows sorting, scrolling, and filtering. You can also send signals to processes directly from htop.

- **ncdu** - Useful for deleting files and directories that are taking up too much space on the hard drive.

- **zsh with oh-my-zsh** - There are a number of benefits of zsh over bash, but I use it so I can easily customize the colors on the terminal to make it nice and pretty.

- **vim** - **VI** i**M**proved. vi with more features, such as split screen, and finer control of configuration.

- **wget and curl** - Useful for pulling data from urls or for testing out API endpoints

- **clang** - Some say it is better than gcc (though don't use it for your assignments, just if you are working on your own C project, you insane person)

Consult your local package manager for instructions.

## Final Notes
There is a lot more that bash has to offer. I simply have presented some of the commands that you would use by for yourself (I haven't even covered vim!).
Managing entire networks, checking to see if a server is up or down, mounting drives, as well as a whole other suite of stuff. You do not have to learn
everything about bash, I had to look up some of these things because I have not had a need to use it yet, so learn however much you need to get
by comfortably and you should be alright. Thanks for reading! And please alert me of any inaccuracies (of which I anticipate there might be a few).
