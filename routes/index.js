var express = require('express');
var router = express.Router();

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var router = require('express').Router();
var mongoose = require('mongoose')

var User = mongoose.model('User');
var Message = mongoose.model('Message');
var ChatRoom = mongoose.model('ChatRoom');

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.isAuthenticated()) {
    res.render('loginhome', {user: req.user, title: 'AI Monitoring of Human Team Planning Conversations'});
  } else {
    res.render('index', { title: 'AI Monitoring of Human Team Planning Conversations' });
  }
});

router.get('/loginhome', function(req, res, next) {
  if(req.isAuthenticated()) {
    User.findOne({"id": req.user.id}, function(err, users) {
        if (err) {
            console.log("And error occured while finding the user");
        }
        ChatRoom.findOne({'id': users.chat_room}, function(err, userchatroom){
            if (err) {
              console.log('An error occurred while finding the user chatroom by ID');
            } else if (userchatroom === null){
                res.render('loginhome', {user: req.user, title: 'AI Monitoring of Human Team Planning Conversations'});
            } else {
                res.redirect('/messaging');
            }
        })
    })
    //res.render('loginhome', {user: req.user, title: 'AI Monitoring of Human Team Planning Conversations'});
  } else {
    res.redirect('/');
  }
});

router.get('/messaging', function(req, res, next) {
    if(req.isAuthenticated()) {
        // req.user must not update instantaneously so we must find the current user in the database to get their
        // chat room
        User.findOne({"id": req.user.id}, function(err, users) {
            if (err) {
                console.log("And error occured while finding the user");
            }
            ChatRoom.findOne({'id': users.chat_room}, function(err, userchatroom){
                if (err) {
                  console.log('An error occurred while finding the user chatroom by ID');
                } else if (userchatroom === null){
                    console.log("userchatroom was found to be",userchatroom);
                    res.redirect('/loginhome');
                } else {
                    time = new Date();
                    currentTime = time.getTime();
                    // As chat rooms time out at 20 minutes right now
                    msSince = currentTime -= userchatroom.creationTime;
                    ageInSec = msSince / 1000;
                    maxAgeSec = 60 * 20;
                    if (ageInSec >= maxAgeSec){
                        res.redirect('/loginhome');
                    } else {
                        res.render('messaging', {user: req.user, title: 'AI Monitoring of Human Team Planning Conversations'});
                    }
                }
            })
        });
    } else {
        res.redirect('/');
    }
});

// Gets the user data to the frontend for some pages where this is nice to have
router.get('/getUser', function(req, res) {
    User.findOne({"id": req.user.id}, function(err, users) {
        if (err) {
            console.log("And error occured while finding the user");
        }
        res.send(users);
    });
});

// Gets the start time of the users conversation
router.get('/getStartTime', function(req, res) {
    ChatRoom.findOne({'id': req.user.chat_room}, function(err, userchatroom){
        if (err) {
          console.log('An error occurred');
        }
        res.send(userchatroom.creationTime);
    })
});

router.get('/checkInChat', function(req, res) {
    User.findOne({"id": req.user.id}, function(err, users) {
        if (err) {
            console.log("And error occured while finding the user");
        }
        ChatRoom.findOne({'id': req.user.chat_room}, function(err, userchatroom){
            if (err) {
              console.log('An error occurred');
            } else if(userchatroom === null) {
                res.send("nope");
                return;
            }
            time = new Date();
            currentTime = time.getTime();
            // As chat rooms time out at 20 minutes right now
            msSince = currentTime -= userchatroom.creationTime;
            ageInSec = msSince / 1000;
            maxAgeSec = 60 * 20;
            if (ageInSec >= maxAgeSec){
                res.send("nope");
            } else {
                res.send("inchat");
            }
        })
    })
});

router.post('/makeChat', function(req, res) {
    var user1ID = req.body.user1ID;
    var user2ID = req.body.user2ID;

    createChat = function(){

        time = new Date();
        currentTime = time.getTime();
        var new_chat = new ChatRoom({
            Users:          [user1ID, user2ID],
            creationTime:   currentTime,
        })
        new_chat.id = new_chat._id.toString();
        new_chat.save();
        return new Promise(function(resolve, reject){
            resolve(new_chat);
        });
    }
    updateUser = function(userid, chatid){
        User.findOne({"id": userid}, function(err, users) {
            if (err) {
                console.log("And error occured while storing a user");
            }
            users.chat_room = chatid;
            users.save();
        });
    }
    addChatToStudent = function(){
        createChat()
        .then(chat => { 
            updateUser(user1ID.toString(), chat.id);
            return chat;
        })
        .then(chat => { 
            updateUser(user2ID.toString(), chat.id);
        })
        .then(() => { res.send("Success") })
        .catch(error => { console.log(error) });

    }
    addChatToStudent();
});

router.post('/newMessage', function(req, res, next) {
    chatRoomID = req.body.chatID;
    newmessage = req.body.newmessage;
    sentby = req.body.sender;

    ChatRoom.findOne({'id': chatRoomID}, function(err, userchatroom){
        if (err) {
          console.log('An error occurred');
        }
        time = new Date();
        currentTime = time.getTime();
        var new_message = new Message({
            message :     newmessage,
            timeCreated : currentTime,
            sender :      sentby,
        })
        userchatroom.Conversation.push(new_message)
        userchatroom.save();
        res.send()
    })

});

router.post('/signup', function(req, res, next) {
    var username = req.body.username;
    var email = req.body.email;
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var password = req.body.password;
    var reenterpassword = req.body.reenterpassword;

  //to find if username already in use
  User.findOne({username: username}, function (err, users) {
    if (err) {
      console.log('An error occurred');
    }
    if(users){
      res.send("usernametaken");
      return;
    }

    //to find if email already in use
    User.findOne({email: email}, function (err, users) {
      if (err) {
        console.log('An error occurred');
      }
      if(users){
        res.send("emailtaken");
        return;
      }
      User.register(new User({username: username, email: email, firstname: firstname, lastname: lastname}), password, function(err) {
        if (err) {
          console.log('error while user register!', err);
          return next(err);
        }
        User.findOne({email: email}, function (err, users) {
          if (err) {
            console.log('An error occurred');
          }
          users.id = users._id.toString();
          users.save();
        });


        res.send("loggedin");
        console.log("loggedin was sent successfully")
      });
    });
  });

});

router.post('/login', passport.authenticate('local'), function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    res.send("loggedin");
    return;
  });



module.exports = router;
