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
included in the vanilla versions (I hope). Windows will also not be covered because
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

+ pwd : Shows your current working directory's absolute path

+ ls (options) (path) : List files in a directory
    + options
        + -a : List all files
        + -l : List files in list form (columns) instead of simplified form (rows)
    + path : path of the directory
    + Sample commands:
        ls : list all files with just their names, except hidden ones
        ls -a : list all files with just their names, including hidden ones
        ls -al : list all files and the details about those files in list format
        ls ./dir : list all files, except hidden files, in the "dir" subdirectory

+ mkdir (-p) [new-directory-path]+ : makes a new directory or directories
    + -p : if given a path, such as dir1/dir2/dir3, it creates all directories down to
            the last directory, in the example, it creates dir1 in the current directory,
            then dir2 in dir1, then dir3 in dir2

+ touch [files]+ : creates a file or files
    + Sample commands:
        + touch text.txt : creates a file called text.txt
        + touch dir1/text.txt : creates a file text.txt in dir1
        + touch text.txt text2.txt : creates the files text.txt and text2.txt

+ rm (-r) (-f) [paths]+ :  remove files and directories
    + -r : removes directories and files. If you are only specifying files in paths, you do
            not require this option. However, if there are directories in the paths supplied,
            this option is required as rm will refuse to remove those directories and their
            contents.
    + -f : do not prompt for removal confirmation when removing files or directories, assume
            that you want to delete everything you specified

+ cp (-r) [srcs]+ [dst] : copy files or directories specified in srcs to dst directory.
    + -r : recursively copy directories and their contents to dst. Required for directories.

+ mv [srcs]+ [dst] : moves files or directories specified in srcs to dst directory

+ find [patterns]+ : finds files whose path matches patterns
    + Sample commands:
        + find text.txt : find files in current directory whose name matches text.txt
        + find t* : find files whose first letter is t
        + find dir1/text.txt : find files in dir1 subdirectory whose name matches text.txt
        + find t* s* : find files whose first letter is t or s

+ echo (string) (>|>>) (file) : print contents in string to standard output or writes it to a file
    + > : replaces contents in _file_ with _string_
    + >> : appends _string_ to _file_
    + Usage of > or >> MUST include a file to write to

+ less [file] : outputs the contents of _file_ to terminal and allows navigation up and down

+ head (-_num_) [file] : outputs the first _num_ lines of _file_ (defaults to 10)

+ tail (-_num_) [file] : outputs the last _num_ lines of _file_ (defailts to 10)

+ cat [files]+ (>|>>) (dst) : combines the contents of _files_ and prints it to terminal or write it to file _dst_

Editing files can also be done in the terminal (oftentimes better than using an editor or IDE if you can
believe it), as all terminals are usually equipped with some type of editor, whether it be _ed_, _nano_, or _vi_/_vim_

### File Permissions, Ownership, Groups, and All Those Goodies
You think we are done with files? lmao. I did not even scratch the tip of the iceberg, I've only scratched the
precipitation on the tip of the iceberg. If you type _ls -al_, you are presented with a bunch of strings and numbers
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
    1. The first letter denotes whether the item is a directory (d), a symlink (l), or a file (-). If it is a _d_ or _-_, it is also
        a hard link while if it is a _l_, it is a symlink.
    2. Then, you have 9 characters, each of which can be r, w, x, or -. These 9 characters represent the permissions for the file, divided by
        user permissions (the first 3 letters), group permissions (the second trio), the global permissions (the last 3 letters). The first
        letter of the group of three means whether the file can be read by the persons indicated (user, group, or global), the second denotes
        whether the file can be written to by the persons, and the last represents whether it can be executed. If read (r), write (w), or
        execute (x) permissions are granted, then the letter will appear in that place and if it is not, then - is placed there.
    3. Examples:
        + -rw-r--r-- : the item is a file (the first -), the use can read and write but not execute the file (the first 3 letters after the first, rw-),
                        the group can read only (the next 3 characters, r--), and everyone (global) can read only (the last 3 characters, r--).
    4. Now, the user is the one who owns the file, the group is the group that the user belongs to (to see what groups you belong to, you can execute
        "groups $USER" and to see who you currently are, you can execute "whoami" or "echo $USER"), and global is everyone who is not the user
        or the users in the group that the user belongs to.
    5. _chmod_ : To add or remove permissions for the file, you would use _chmod_.
        1. Sample commands
            + chmod +x file : Allow user, group, and global to execute the file
            + chmod u+x file : Add execute permission for user to file
            + chmod g-x file : Remove execution permission from group for file
            + chmod w-w file : Remove write permissions for global for file
            + chmod ug+r file : Add read permission for user and group for file
        2. You can also use numerical codes to edit the permissions for the file. To change permissions using numeric codes, the numeric code must be
            exactly 3 numbers long (e.g. 123) and the numbers are determined by the binary representations of the permissions, i.e. if a permission
            is allowed, it holds the value of 1 and if it is not, it holds the value of 0. Therefore, if the permission is r-x, the binary would be
            101, or in decimal format, it would be 5. Therefore, if one wants to change a file's permission to rw-rw-rw, then you would execute the
            command: chmod 666 file.
        3. _chown_ : To change the owner and/or group of a file or directory, you would use the command _chown_.
            To change the user, to say user1, one would execute "chown user1 file". To change user and group, to user1 and group1,
            it would be "chown user1:group1 file". If you wish to recursively change ownership for a directory, you can execute
            "chown -R user1 dir1" or "chown --recursive user1 dir1".
2. This is the number of hard links to the file. If the item is a file, it is set to 1. If it is a directory, it is set to the number of
    subdirectories and files plus the parent directory.
3. The owner of the file.
4. The group the owner belongs to.
5. The size of the file in bytes.
6. The month of last modification.
7. The day of last modification.
9. The time of last modification.
10. The name of the file or directory.

### Space Usage
df (-h) : Shows the disk space and usage of all currently mounted file systems. Add "-h" to make output human-readable.
du (-h) [directory] : Shows the disk usage of everyting in _directory_. Add "-h" to make output human-readable. You can also add "| sort -n" to
                        sort files by size (this is called piping and will be covered in the next section).

### Piping
One of the things you can do is use the output in one command and use it the argument in another. This is accomplished through the pipe ("|") character, with
the output of the command on the left of the pipe character as the input of the command to the right of the pipe character. This also allows the
introduction to the _grep_ command, which can be used to find a pattern in an output piped to it. For example, you can do "ls | grep text" to find a file
or directory called text in the output of the ls command. This is the same as "find text".

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
