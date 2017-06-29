var express = require('express');
var router = express.Router();

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var router = require('express').Router();
var mongoose = require('mongoose')
var Promise = require('promise');

var User = mongoose.model('User');
var Plan = mongoose.model('Plan');
var Message = mongoose.model('Message');
var ChatRoom = mongoose.model('ChatRoom');

var maxAgeSec = 60*20 + 5;
var maxAgems = maxAgeSec * 1000;

////////////////////////////////////////////////////////////////////////////////////////////////
// Initial pages
router.get('/', function(req, res, next) {
  // res.render('index', {title: 'Emergency Response Planning'});
  res.redirect('/intro');
});

// Get intro page
router.get('/intro', function(req, res, next) {
  res.render('intro', {user: req.user, title: 'Emergency Response Planning'});
});

//get consent form page
router.get('/consentform', function(req, res, next) {
  res.render('consentform', {user: req.user, title: 'Emergency Response Planning'});
});

//get consent form page
router.get('/scenario', function(req, res, next) {
  res.render('scenario', {user: req.user, title: 'Emergency Response Planning'});
});

// This is really the queue page, was login home back in the day
router.get('/loginhome', function(req, res, next) {
  res.render('loginhome', {title: 'Emergency Response Planning'});
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
    .exec(function (err, chatrooms) {
        if (err) return handleError(err);
        returndata = [];
        time = new Date();
        currentTime = time.getTime();
        for (i=0; i < chatrooms.length; i++) {
            msSince = currentTime - chatrooms[i].startTime;
            ageInSec = msSince / 1000;
            if (ageInSec >= maxAgeSec){
                chatrooms[i].completed = true;
                chatrooms[i].active = false;
                chatrooms[i].save();
            } else {
                returndata.push(chatrooms[i]);
            }
        }
        res.render('admin', {chats: returndata, title: 'Emergency Response Planning'});
    })
  } else {
    res.render('index', {title: 'Emergency Response Planning'});
  }
});

router.get('/makeroom', function(req, res, next) {
  //Lean basically makes it so we have raw javascript objects, which increases run time
  if(req.isAuthenticated() && req.user.admin) {
    ChatRoom
    .find({"available": true})
    .lean()
    .exec(function (err, chatrooms) {
        if (err) return handleError(err);

        res.render('makeroom', {chats: chatrooms, title: 'Emergency Response Planning'});
    })
  } else {
    res.redirect('/');
  }
});

router.post('/makeUnavailable', function(req, res, next) {
    ChatRoom.findOne({'id': req.body.chat}, function(err, userchatroom){
        if (err) {
          console.log('An error occurred');
        } 
        userchatroom.available = false;
        userchatroom.save();
        res.send("success");
    })
});

router.get('/makeChat', function(req, res, next) {
  // Lean basically makes it so we have raw javascript objects, which increases run time
    makechat = function() {
        var new_chat = new ChatRoom({
        })
        return new Promise(function(resolve, reject){
            resolve(new_chat);
        })
        .then(chat => {
            chat.id = chat._id.toString();
            return chat;
        })
        .then(chat => {
            chat.save();
            return chat;
        })
        .then(chat => {
            res.send(chat.id);
        })
        .catch(error => { console.log(error) });
    }

    makechat();
  
});

router.get('/getAllChat', function(req, res) {
    ChatRoom
    .find({"active": true})
    .populate({path: 'Conversation', options:{sort: {'timeCreated': 1}}})
    .exec(function (err, chatrooms) {
        if (err) return handleError(err);
        returndata = [];
        time = new Date();
        currentTime = time.getTime();
        for (i=0; i < chatrooms.length; i++) {
            msSince = currentTime - chatrooms[i].startTime;
            ageInSec = msSince / 1000;
            if (ageInSec >= maxAgeSec){
                chatroom[i].completed = true;
                chatroom[i].active = false;
                chatroom[i].save();
            } else {
                returndata.push(chatrooms[i]);
            }
        }
        res.send(returndata);
    })
});

router.get('/chatarchive', function(req, res, next) {
  //Lean basically makes it so we have raw javascript objects, which increases run time
  if(req.isAuthenticated() && req.user.admin) {
    ChatRoom
    .find({"complete": true})
    .populate({path: 'Conversation', options:{sort: {'timeCreated': 1}}})
    .lean()
    .exec(function (err, chatrooms) {
        if (err) return handleError(err);
        res.render('chatarchive', {chats: chatrooms, title: 'Emergency Response Planning'});
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
    res.render('messaging', {title: 'Emergency Response Planning'});
});

// Gets the start time of the users conversation
router.post('/getChat', function(req, res) {
    ChatRoom
    .find({"id": req.body.chatroom})
    .populate({path: 'Conversation', options:{sort: {'timeCreated': 1}}})
    .exec(function (err, chatrooms) {
        if (err) return handleError(err);
        chatroom = chatrooms[0];
        if (chatroom.completed) {
            res.send("expired");
            return;
        }
        time = new Date();
        currentTime = time.getTime();
        // As chat rooms time out at 20 minutes right now
        msAge = currentTime - chatroom.startTime;
        // ageInSec = msSince / 1000;
        timeRemaining = maxAgems - msAge;
        console.log("msAge is", msAge);
        console.log();
        console.log("timeRemaining in ms is registered as", timeRemaining);
        console.log();
        if (timeRemaining <= 0) {
            console.log("timeRemaining is registered as <= 0");
            chatroom.completed = true;
            chatroom.save();
            res.redirect("/loginhome");
        } else {
            console.log("We went down the else route and everything was sent correctly");
            res.send({'room': chatroom, 'timeRemaining': timeRemaining});
        }
    })
});

// router.post('/closeChat', function(req, res) {
//     ChatRoom.findOne({'id': req.user.chat_room}, function(err, userchatroom){
//         if (err) {
//           console.log('An error occurred');
//         }
//         if (userchatroom.active) {
//             userchatroom.active = false;
//             userchatroom.save();
//             res.send('Success');
//         }
//     })
// });

router.post('/checkChat', function(req, res) {
    var roomID = req.body.room;
    ChatRoom.findOne({'id': roomID}, function(err, userchatroom){
        if (err) {
          console.log('An error occurred');
        } else if(userchatroom === null || userchatroom.available) {
            res.send("noroom");
            return;
        } else if(userchatroom.startTime === undefined) {
            res.send();
        }
        time = new Date();
        currentTime = time.getTime();
        // As chat rooms time out at 20 minutes right now
        msSince = currentTime - userchatroom.startTime;
        ageInSec = msSince / 1000;
        if (ageInSec >= maxAgeSec){
            userchatroom.completed = true;
            userchatroom.save();
            res.send("expired");
        } else {
            if (userchatroom.active) {
                res.send("active")
            } else {
            res.send();
            }
        }
    })
});

////////////////////////////////////////////////////////////////////////////////////////////////
// Submit plan page

router.get('/submitplan', function(req, res, next) {
    // if(req.isAuthenticated()) {
    //     res.render('submitplan', {user: req.user, title: 'Emergency Response Planning'});
    //     ChatRoom.findOne({'id': req.user.chat_room}, function(err, userchatroom){
    //         if (err) {
    //           console.log('An error occurred while finding the user chatroom by ID');
    //         } else if (userchatroom === null || userchatroom.active || req.user.planSubmitted){
    //             res.redirect('/loginhome');
    //         } else {
    //             res.render('submitplan', {user: req.user, title: 'Emergency Response Planning'});
    //         }
    //     });
    // } else {
    //     res.redirect('/');
    // }
    res.render('submitplan', {title: 'Emergency Response Planning'});
});

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
    if (req.user.admin) {
        res.send("admin");
    } else {
        res.send("loggedin");
    }
    return;
  });



module.exports = router;
