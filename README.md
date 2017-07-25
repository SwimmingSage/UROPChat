# UROPChat
Download files

To get required dependancies go to directory in terminal and type the command

**npm install**

This will install the required dependancies

You will also want to create an empty data folder in this directory
This is where the data will be stored when using your own computer to run this

To begin running database type and enter this into terminal

**mongod --dbpath ./data**

In another terminal window you will now want to begin running the application, to do this type and enter the command below in this projects directory

**nodemon**

If that doesn't work then type and enter

**npm run start**

nodemon is preferred as it automatically restarts the server upon making any changes to the files

# Instructions for Creating Admin User
1. Follow steps above to set up database on local device
2. Go to "localhost:3000/admin"
3. Sign up as a user
4. Open a new tab in terminal and type "Mongo" to open the mongo shell
5. Enter in the shell: db.users.update({'username':'(your username in lowercase'}, {$set: {'admin':true}})
6. Refresh the admin page and login if you are not already logged in
