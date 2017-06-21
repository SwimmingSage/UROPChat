var express = require('express');
var router = express.Router();

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var router = require('express').Router();
var mongoose = require('mongoose')

var User = mongoose.model('User');
var Plan = mongoose.model('Plan');
var Message = mongoose.model('Message');
var ChatRoom = mongoose.model('ChatRoom');

var maxAgeSec = 60*20 + 5;

////////////////////////////////////////////////////////////////////////////////////////////////
// Initial pages
router.get('/', function(req, res, next) {
  if(req.isAuthenticated()) {
    res.redirect('/loginhome');
  } else {
    res.render('index', { title: 'AI Monitoring of Human Team Planning Conversations' });
  }
});

// Get intro page
router.get('/intro', function(req, res, next) {
  if(req.isAuthenticated()) {
    if (req.user.admin) {
    res.redirect('/admin');
    } else {
    res.render('intro', {user: req.user, title: 'AI Monitoring of Human Team Planning Conversations'});
    }
  } else {
    res.render('index', { title: 'AI Monitoring of Human Team Planning Conversations' });
  }
});

//get consent form page
router.get('/consentform', function(req, res, next) {
  if(req.isAuthenticated()) {
    res.render('consentform', {user: req.user, title: 'AI Monitoring of Human Team Planning Conversations'});
  } else {
    res.render('index', { title: 'AI Monitoring of Human Team Planning Conversations' });
  }
});

//get consent form page
router.get('/scenario', function(req, res, next) {
  if(req.isAuthenticated()) {
    res.render('scenario', {user: req.user, title: 'AI Monitoring of Human Team Planning Conversations'});
  } else {
    res.render('index', { title: 'AI Monitoring of Human Team Planning Conversations' });
  }
});

// This is really the queue page, was login home back in the day
router.get('/loginhome', function(req, res, next) {
  if(req.isAuthenticated()) {
    User.findOne({"id": req.user.id}, function(err, users) {
        if (err) {
            console.log("And error occured while finding the user");
        }
        ChatRoom.findOne({'id': users.chat_room}, function(err, userchatroom){
            if (err) {
              console.log('An error occurred while finding the user chatroom by ID');
            } else if (userchatroom === null || !(userchatroom.active)){
                res.render('loginhome', {user: req.user, title: 'AI Monitoring of Human Team Planning Conversations'});
            } else {
                time = new Date();
                currentTime = time.getTime();
                // As chat rooms time out at 20 minutes right now
                msSince = currentTime -= userchatroom.creationTime;
                ageInSec = msSince / 1000;
                if (ageInSec >= maxAgeSec){
                    userchatroom.active = false;
                    userchatroom.save();
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

////////////////////////////////////////////////////////////////////////////////////////////////
// Admin page stuff

router.get('/admin', function(req, res, next) {
  // Lean basically makes it so we have raw javascript objects, which increases run time
  // .find({"active": true})
  if(req.isAuthenticated() && req.user.admin) {
    ChatRoom
    .find({"active": true})
    .populate({path: 'Conversation', options:{sort: {'timeCreated': 1}}})
    .lean()
    .exec(function (err, chatrooms) {
        if (err) return handleError(err);
        // console.log(chatrooms);
        res.render('admin', {chats: chatrooms, title: 'AI Monitoring of Human Team Planning Conversations'});
    })
  } else {
    res.redirect('/');
  }
});

router.get('/getAllChat', function(req, res) {
    ChatRoom
    .find({"active": true})
    .populate({path: 'Conversation', options:{sort: {'timeCreated': 1}}})
    .lean()
    .exec(function (err, chatrooms) {
        if (err) return handleError(err);
        res.send(chatrooms)
    })
});

router.get('/chatarchive', function(req, res, next) {
  //Lean basically makes it so we have raw javascript objects, which increases run time
  ChatRoom
  .find({"active": true})
  if(req.isAuthenticated() && req.user.admin) {
    ChatRoom
    .find({"active": false})
    .populate({path: 'Conversation', options:{sort: {'timeCreated': 1}}})
    .lean()
    .exec(function (err, chatrooms) {
        if (err) return handleError(err);
        res.render('chatarchive', {chats: chatrooms, title: 'AI Monitoring of Human Team Planning Conversations'});
    })
  } else {
    res.redirect('/');
  }
});

router.get('/chatarchiveq', function(req, res, next) {
    // .populate({path: 'user1plan', options:{sort: {'stepnumber': 1}}})
    // .populate({path: 'user2plan', options:{sort: {'stepnumber': 1}}})
    ChatRoom
    .find({"active": false})
    .populate({path: 'Conversation', options:{sort: {'timeCreated': 1}}})
    .populate({path: 'user1plan', options:{sort: {'stepnumber': 1}}})
    .populate({path: 'user2plan', options:{sort: {'stepnumber': 1}}})
    .lean()
    .exec(function (err, chatrooms) {
        if (err) return handleError(err);
        res.render('chatarchiveq', {chats: chatrooms});
    })
});

////////////////////////////////////////////////////////////////////////////////////////////////
// Associated things for the messaging page

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
                } else if (userchatroom === null || !(userchatroom.active)){
                    res.redirect('/loginhome');
                } else {
                    time = new Date();
                    currentTime = time.getTime();
                    // As chat rooms time out at 20 minutes right now
                    msSince = currentTime -= userchatroom.creationTime;
                    ageInSec = msSince / 1000;
                    if (ageInSec >= maxAgeSec){
                        userchatroom.active = false;
                        userchatroom.save();
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

router.get('/getUserSubmit', function(req, res) {
    User.findOne({"id": req.user.id}, function(err, users) {
        if (err) {
            console.log("And error occured while finding the user");
        }
        users.planSubmitted = true;
        users.save();
        res.send(users);
    });
});

// Gets the start time of the users conversation
router.get('/getChat', function(req, res) {
    ChatRoom
    .find({"id": req.user.chat_room})
    .populate({path: 'Conversation', options:{sort: {'timeCreated': 1}}})
    .exec(function (err, chatrooms) {
        if (err) return handleError(err);
        res.send(chatrooms);
    })
});

router.post('/closeChat', function(req, res) {
    ChatRoom.findOne({'id': req.user.chat_room}, function(err, userchatroom){
        if (err) {
          console.log('An error occurred');
        }
        if (userchatroom.active) {
            userchatroom.active = false;
            userchatroom.save();
            res.send('Success');
        }
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
            } else if(userchatroom === null || !userchatroom.active) {
                res.send("nope");
                return;
            }
            time = new Date();
            currentTime = time.getTime();
            // As chat rooms time out at 20 minutes right now
            msSince = currentTime -= userchatroom.creationTime;
            ageInSec = msSince / 1000;
            if (ageInSec >= maxAgeSec){
                userchatroom.active = false;
                userchatroom.save();
                res.send("nope");
            } else {
                res.send("inchat");
            }
        })
    })
});

////////////////////////////////////////////////////////////////////////////////////////////////
// Submit plan page

router.get('/submitplan', function(req, res, next) {
    if(req.isAuthenticated()) {
        ChatRoom.findOne({'id': req.user.chat_room}, function(err, userchatroom){
            if (err) {
              console.log('An error occurred while finding the user chatroom by ID');
            } else if (userchatroom === null || userchatroom.active || req.user.planSubmitted){
                res.redirect('/loginhome');
            } else {
                res.render('submitplan', {user: req.user, title: 'AI Monitoring of Human Team Planning Conversations'});
            }
        });
    } else {
        res.redirect('/');
    }
});

// We had this in below
// ChatRoom.findOne({'id': req.user.chat_room}, function(err, userchatroom){
//     if (err) {
//       console.log('An error occurred');
//     }
//     return new Promise(function(resolve, reject){
//         resolve(userchatroom);
//     });
// })

router.post('/addPlan', function(req, res) {
    var plan = JSON.parse(req.body.plan);
    var plannumber;
    createstep = function(step, act, loc, chat) {
        var plan_step = new Plan({
            user:            req.user.id,
            stepnumber:      step,
            action:          act,
            location:        loc,
        })
        plan_step.save();
        if(plannumber === 1) {
            chat.user1plan.push(plan_step);
        } else {
            chat.user2plan.push(plan_step);
        }
        return plan_step;
    }
    ChatRoom
    .findOne({"id": req.user.chat_room})
    .populate({path: 'user1plan', options:{sort: {'stepnumber': 1}}})
    .populate({path: 'user2plan', options:{sort: {'stepnumber': 1}}})
    .exec(function (err, userchatroom) {
        if (err) {
          console.log('An error occurred while finding the user chatroom by ID');
        }
        return new Promise(function(resolve, reject){
            resolve(userchatroom);
        });
    })
    .then(chat => {
        if (chat.user1plan.length != 0) {
            if(chat.user1plan[0].user != req.user.id) {
                plannumber = 2;
            } else{
                chat.user1plan = [];
                chat.save();
                plannumber = 1;
            }
        } else {
            plannumber = 1;
        }
        return chat;
    })
    .then(chat => {
        for (i=0; i < plan.length; i++) {
            thisStep = plan[i];
            createstep(thisStep.stepnumber, thisStep.action, thisStep.location, chat);
        }
        return chat;
    })
    .then(chat => {
        chat.save();
    })
    .then(() => {res.send('success')})
    .catch(error => { console.log(error) });
});

////////////////////////////////////////////////////////////////////////////////////////////////
// Sign Up and login stuff
router.post('/signup', function(req, res, next) {
    var email = req.body.email;
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var password = req.body.password;
    var reenterpassword = req.body.reenterpassword;
    //to find if email already in use
                 // as passport keeps the email as the username, or I'm making it do that at least
    User.findOne({'username': email}, function (err, users) {
      if (err) {
        console.log('An error occurred');
      }
      if(users != null){
        res.send("emailtaken");
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
