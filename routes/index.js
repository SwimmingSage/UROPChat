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
                time = new Date();
                currentTime = time.getTime();
                // As chat rooms time out at 20 minutes right now
                msSince = currentTime -= userchatroom.creationTime;
                ageInSec = msSince / 1000;
                maxAgeSec = 60 * 20;
                if (ageInSec >= maxAgeSec){
                    res.render('loginhome', {user: req.user, title: 'AI Monitoring of Human Team Planning Conversations'});
                } else {
                    res.redirect('/messaging');
                }
            }
        })
    })
  } else {
    res.redirect('/');
  }
});

// router.get('/loginhome1', function(req, res, next) {
//   if(req.isAuthenticated()) {
//     res.render('loginhome', {user: req.user, title: 'AI Monitoring of Human Team Planning Conversations'});
//   } else {
//     res.redirect('/');
//   }
// });


router.get('/admin', function(req, res, next) {
  if(req.isAuthenticated()) {
    // ChatRoom.find({}, function(err, allconversations) {
    //     if (err) {
    //         console.log("And error occured while finding the user");
    //     }
    //     populate(allconversations.Conversation)
    //.populate('Conversation Users')
    // });
    ChatRoom
    .find()
    .populate({path: 'Conversation', model: 'Message'})
    .populate({path: 'Users', model: 'User'})
    .exec(function (err, chatrooms) {
        if (err) return handleError(err);
        console.log(chatrooms);
        res.render('admin', {chats: chatrooms, title: 'AI Monitoring of Human Team Planning Conversations'});
    })
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
            // maxAgeSec = 60 * 20;
            maxAgeSec = 30;
            if (ageInSec >= maxAgeSec){
                res.send("nope");
            } else {
                res.send("inchat");
            }
        })
    })
});

router.post('/signup', function(req, res, next) {
    var email = req.body.email;
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var password = req.body.password;
    var reenterpassword = req.body.reenterpassword;

    //to find if email already in use
                 // as passport keeps the email as the username
    User.findOne({'username': email}, function (err, users) {
      if (err) {
        console.log('An error occurred');
      }
      console.log("The user found was",users);
      if(users != null){
        res.send("emailtaken");
        console.log("We found another identical email");
        return;
      } else {                    // We are using email and not username
          User.register(new User({username: email, firstname: firstname, lastname: lastname}), password, function(err) {
            if (err) {
              console.log('error while user register!', err);
              return next(err);
            }
            User.findOne({username: email}, function (err, users) {
              if (err) {
                console.log('An error occurred');
              }
              users.id = users._id.toString();
              users.save();
            });
            res.send("loggedin");
            console.log("loggedin was sent successfully")
          });
      }
    });

});

router.post('/login', passport.authenticate('local'), function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    res.send("loggedin");
    return;
  });



module.exports = router;
