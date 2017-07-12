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
var ChatSystem = mongoose.model('ChatSystem');

var shortid = require('shortid');

var maxAgeChat = (60*20) * 1000;

var maxScenarioTime = (60 * 5 + 5) * 1000;

// Used to get the current time in ms for later functions
function getCurrentTime(){
    var time = new Date();
    return time.getTime();
}

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
router.get('/scenario1', function(req, res, next) {
  res.render('scenario1', {user: req.user, title: 'Emergency Response Planning'});
});

// This is really the queue page, was login home back in the day
router.get('/loginhome', function(req, res, next) {
  res.render('loginhome', {title: 'Emergency Response Planning'});
});

////////////////////////////////////////////////////////////////////////////////////////////////
// Admin page stuff

router.get('/admin', function(req, res, next) {
  // Lean basically makes it so we have raw javascript objects, which increases run time
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
            if (chatrooms[i].startTime === undefined) { // for the case that the chat room has not yet begun
                continue;
            }
            msSince = currentTime - chatrooms[i].startTime;
            ageInSec = msSince / 1000;
            if (ageInSec >= maxAgeSec){ // this updates the chat room in case chat is not properly closed
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
  //Lean basically makes it so we have raw javascript objects, which decreases run time
  if(req.isAuthenticated() && req.user.admin) {
    ChatSystem
    .find({"available": true})
    .lean()
    .exec(function (err, chatsystems) {
        if (err) return handleError(err);

        res.render('makeroom', {chats: chatsystems, title: 'Emergency Response Planning'});
    })
  } else {
    res.redirect('/');
  }
});

router.post('/makeUnavailable', function(req, res, next) {
    ChatSystem.findOne({'id': req.body.chatsystem}, function(err, userchatroom){
        if (err) {
          console.log('An error occurred');
        } 
        userchatroom.available = false;
        userchatroom.save();
        res.send("success");
    })
});

router.get('/makeChat', function(req, res, next) {
    function makechat() {
        var new_chat = new ChatRoom({});
        new_chat.id = new_chat._id.toString();
        new_chat.save();
        return new_chat;
    }

     function makechatsystem() {
        var newchatsystem = new ChatSystem({
            User1:    shortid.generate(),
            User2:    shortid.generate()
        })
        return new Promise(function(resolve, reject){
            resolve(newchatsystem);
        })
        .then(chatsystem => {
            chatsystem.id = chatsystem._id.toString();
            return chatsystem;
        })
        .then(chatsystem => {
            chatsystem.scenario1 = makechat();
            chatsystem.scenario2 = makechat();
            return chatsystem;
        })
        .then(chatsystem => {
            chatsystem.save();
            return chatsystem;
        })
        .then(chatsystem => {
            res.send(chatsystem);
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
        startTimes = {};
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
                // As chat rooms time out at 20 minutes right now
                var msAge = currentTime - chatrooms[i].startTime;
                // ageInSec = msSince / 1000;
                var timeRemaining = maxAgems - msAge;
                startTimes[chatrooms[i].id] = timeRemaining;
            }
        }
        res.send({"rooms":returndata, "times": startTimes});
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

router.get('/messaging1', function(req, res, next) {
    res.render('messaging1', {title: 'Emergency Response Planning'});
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
        var time = new Date();
        var currentTime = time.getTime(); // the current time in ms
        var msAge = currentTime - chatroom.startTime;
        var timeRemaining = maxAgems - msAge;
        if (timeRemaining <= 0) {
            console.log("timeRemaining is registered as <= 0");
            chatroom.completed = true;
            chatroom.active = false;
            chatroom.save();
            //res.redirect("/loginhome"); // I can't do this I think
        } else {
            res.send({'room': chatroom, 'timeRemaining': timeRemaining});
        }
    })
});

router.post('/checkSystem', function(req, res) {
    var systemID = req.body.system;
    var entryid = req.body.id;
    ChatSystem.findOne({'id': systemID}, function(err, userchatsystem){
        if (err) {
          console.log('An error occurred');
        } else if(userchatsystem === null || userchatsystem.available || userchatsystem.complete || 
        (userchatsystem.User1 != entryid && userchatsystem.User2 != entryid) ) { // chat system doesn't exist, is not yet available, already used, or invalid user credentials
            res.send("nosystem");
        } else if(userchatsystem.location === undefined) { // The chat system the user is in has not yet begun
            res.send();
        } else { // Chat system has begun, we must determine current page that the users are on
            determineLocation(userchatsystem, confirm);
        }
    })
});

function determineLocation(chatsystem, confirm) { // if confirm === false then we are determining where we should redirect user,
    switch (chatsystem.location) {                // otherwise we are confirming if this is the correct page location
        case "scenario1info":
            checkScenario(chatsystem, confirm);
            break;
        case "messaging1":
            checkChat(chatsystem, confirm);
            break;
        case "submitplan1":
            if (confirm) {
                res.send();
            } else { // if we are determining where to send user
                res.send('/submitplan1');
            }
            break;
        case "scenario2info":
            checkScenario(chatsystem, confirm);
            break;
        case "messaging2":
            checkChat(chatsystem, confirm);
            break;
        case "submitplan2":
            if (confirm) {
                res.send();
            } else { // if we are determining where to send user
                res.send('/submitplan2');
            }
            break;
        case "endPage":
            res.send(); // this is where I should send the user to the final page
            break;
        default: // we should in theory never get here
            res.send();
    }
}

function checkScenario(chatsystem, confirm) {
    var currentTime, msAge, redirect;
    currentTime = getCurrentTime();
    msAge = currentTime - chatsystem.sectionTime;
    if (msAge > maxScenarioTime) {
        if (chatsystem.location === "scenario1info") {
            chatsystem.location = "messaging1";
            redirect = "/messaging1";
        } else {
            chatsystem.location = "messaging2";
            redirect = "/messaging2";
        }
        chatsystem.sectionTime = undefined; // the chat room object keeps track of time
        chatsystem.save();
        res.send(redirect);
    } else {
        if (confirm) { // If here this is the correct page
            res.send();
        } else { // if we are determining where to send user
            if (chatsystem.location === "scenario1") {
                res.send('/scenario1');
            } else {
                res.send('/scenario2');
            }
        }
    }
}

function checkChat(chatsystem, confirm) {
    var currentTime, msAge, chatroom, redirect;
    ChatSystem
    .findOne({"id": chatsystem.id})
    .populate({path: chatsystem.location})
    .exec(function (err, popchatsystem) { //populated chat system
        if (err) {
          console.log('An error occurred while finding the user chatroom by ID');
        }
        if (chatsystem.location === "scenario1") {
            chatroom = popchatsystem.scenario1;
        } else {
            chatroom = popchatsystem.scenario2;
        }

        currentTime = getCurrentTime();
        msAge = currentTime - chatroom.startTime;
        if (msAge >= maxAgeChat){
            chatroom.completed = true;
            chatroom.active = false;
            chatroom.save();
            if (chatsystem.location === "scenario1") {
                popchatsystem.location = "submitplan1";
                redirect = "/submitplan1"
            } else {
                popchatsystem.location = "submitplan2";
                redirect = "/submitplan2"
            }
            popchatsystem.save();
            res.send(redirect);
        } else {
            if (confirm) { // if here this is the correct page
                res.send();
            } else { // if we are determining where to send user
                if (chatsystem.location === "scenario1") {
                    res.send('/messaging1');
                } else {
                    res.send('/messaging2');
                }
            }
        }
    })
}

// gonna want this to check chat later
// router.post('/checkChat', function(req, res) {
//     var systemID = req.body.system;
//     var entryid = req.body.id;
//     console.log("entryid is", entryid);
//     console.log("req.body.id is", req.body.id);
//     ChatSystem.findOne({'id': systemID}, function(err, userchatroom){
//         if (err) {
//           console.log('An error occurred');
//         } else if(userchatroom === null || userchatroom.available) {
//             res.send("nosystem");
//             return;
//         } else if(userchatroom.startTime === undefined) {
//             res.send();
//         } else if(userchatroom.User1 != entryid && userchatroom.User2 != entryid) {
//             res.send("noroom");
//         } else {
//             time = new Date();
//             currentTime = time.getTime();
//             // As chat rooms time out at 20 minutes right now
//             msSince = currentTime - userchatroom.startTime;
//             ageInSec = msSince / 1000;
//             if (ageInSec >= maxAgeSec){
//                 userchatroom.completed = true;
//                 userchatroom.active = false;
//                 userchatroom.save();
//                 res.send("expired");
//             } else {
//                 if (userchatroom.active) {
//                     res.send("active")
//                 } else {
//                 res.send();
//                 }
//             }
//         }
//     })
// });

////////////////////////////////////////////////////////////////////////////////////////////////
// Submit plan page

router.get('/submitplan1', function(req, res, next) {
    res.render('submitplan1', {title: 'Emergency Response Planning'});
});

router.post('/addPlan', function(req, res) {
    var plan = JSON.parse(req.body.plan);
    var name = req.body.name;
    var room = req.body.room;
    var userid = req.body.userid;
    var plannumber;
    function createstep(step, act, loc, chat) {
        var plan_step = new Plan({
            user:            userid,
            name:            name,
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
    }
    ChatRoom
    .findOne({"id": room})
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
        if (chat.User1 === userid) {
            if (chat.user1plan.length != 0) {
                for (i = 0; i < chat.user1plan.length; i++) {
                    chat.user1plan[i].remove(); // remove former plans from database
                }
                chat.user1plan = []; // redefine plan as empty array
                chat.save();
            }
            plannumber = 1;
        } else {
            if (chat.user2plan.length != 0) {
                for (i = 0; i < chat.user2plan.length; i++) {
                    chat.user2plan[i].remove(); // remove former plans from database
                }
                chat.user2plan = []; // redefine empty plan as empty array
                chat.save();
            }
            plannumber = 2;
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
// Sign Up and login stuff for admin users
router.post('/signup', function(req, res, next) {
    var email = req.body.email;
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var password = req.body.password;
    var reenterpassword = req.body.reenterpassword;
    //to find if email already in use
                 // Using as username
    User.findOne({'username': email}, function (err, users) {
      if (err) {
        console.log('An error occurred');
      }
      if(users != null){
        res.send("emailtaken");
        return;
      } else {                    // Using as username
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
