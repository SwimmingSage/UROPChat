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
var maxScenarioTime = (60 * 5) * 1000;
var maxSubmitTime = (60 * 5) * 1000;


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
  res.render('intro', {title: 'Emergency Response Planning'});
});

//get consent form page
router.get('/consentform', function(req, res, next) {
  res.render('consentform', {title: 'Emergency Response Planning'});
});

// This is where a user enters credentials and waits for partner to meet up
router.get('/loginhome', function(req, res, next) {
  res.render('loginhome', {title: 'Emergency Response Planning'});
});

// scenario pages
router.get('/scenario1', function(req, res, next) {
  if(req.isAuthenticated()) {
    laterCheck();
  } else {
    res.redirect('/loginhome');
  }
});
router.get('/scenario2', function(req, res, next) {
  if(req.isAuthenticated()) {
    laterCheck();
  } else {
    res.redirect('/loginhome');
  }
});

// chat pages
router.get('/messaging1', function(req, res, next) {
  if(req.isAuthenticated()) {
    laterCheck();
  } else {
    res.redirect('/loginhome');
  }
});
router.get('/messaging2', function(req, res, next) {
  if(req.isAuthenticated()) {
    laterCheck();
  } else {
    res.redirect('/loginhome');
  }    
});

// submitplan pages
router.get('/submitplan1', function(req, res, next) {
  if(req.isAuthenticated()) {
    laterCheck();
  } else {
    res.redirect('/loginhome');
  }
});
router.get('/submitplan2', function(req, res, next) {
  if(req.isAuthenticated()) {
    laterCheck();
  } else {
    res.redirect('/loginhome');
  }
});

// endpage, final page of user chat
router.get('/endpage', function(req, res, next) {
  if(req.isAuthenticated()) {
    laterCheck();
  } else {
    res.redirect('/loginhome');
  }
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
            msAge = currentTime - chatrooms[i].startTime;
            if (msAge >= maxAgeChat){ // this updates the chat room in case chat is not properly closed
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
            chatsystem.scenario1 = makechat("uav");
            chatsystem.scenario2 = makechat("missile");
            return chatsystem;
        })
        .then(chatsystem => {
            createUser(chatsystem.User1, chatsystem.id);
            createUser(chatsystem.User2, chatsystem.id);
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

    makechatsystem();
  
});

function makechat(scenario) {
    var new_chat = new ChatRoom({
        type: scenario,
    });
    new_chat.id = new_chat._id.toString();
    new_chat.save();
    return new_chat;
}

function createUser(userID, chatsystemID) {
    var password = 1;
    User.register(new User({username: userID, systemID: chatsystemID, id: userID}), password, function(err) {
        if (err) {
          console.log('error while user register!', err);
          return next(err);
        }
    });
}



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
            msAge = currentTime - chatrooms[i].startTime;
            if (msAge >= maxAgeChat){
                chatroom[i].completed = true;
                chatroom[i].active = false;
                chatroom[i].save();
            } else {
                returndata.push(chatrooms[i]);
                // As chat rooms time out at 20 minutes right now
                var msAge = currentTime - chatrooms[i].startTime;
                var timeRemaining = maxAgeChat - msAge;
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
// Associated things for authentication structure

router.post('/checkSystem', function(req, res) {
    var systemID = req.body.system;
    var entryid = req.body.id;
    var name = req.body.name;
    initialCheck(systemID, entryid, name);
});

function initialCheck(systemID, entryid, name) {
    ChatSystem
    .findOne({"id": systemID})
    .populate('scenario1 scenario2')
    .exec(function (err, userchatsystem) {
        if (err) {
          console.log('An error occurred');
        } 
        if(userchatsystem === null || userchatsystem.available || userchatsystem.complete || 
        (userchatsystem.User1 != entryid && userchatsystem.User2 != entryid) ) { // chat system doesn't exist, is not yet available, already used, or invalid user credentials
            if (confirm) {
                returnobject = {'correct': 'false', 'redirect': '/loginhome'};
                res.send(returnobject);
            } else {
                res.send("nosystem");
            }
        } else if(userchatsystem.location === "none") { // The chat system the user is in has not yet begun
            assignName(entryid, name);
            res.send();
        } else { // Chat system has begun, we must determine current page that the users are on
            res.send("systemBegun")
        }
    })
}

function assignName(entryid, name) {
    User.findOne({'username': entryid}, function (err, users) {
      if (err) {
        console.log('An error occurred');
      }
      user.name = name;
      user.save();
  })
}

function laterCheck() { // User must already be logged in if they got here, thus they are a valid user in a valid chat system
    ChatSystem
    .findOne({"id": req.user.systemID})
    .exec(function (err, userchatsystem) {
        if (err) {
          console.log('An error occurred');
        } 
        switch (userchatsystem.location) {
            case "scenario1info":
                res.render('scenario1', {title: 'Emergency Response Planning'});
                break;
            case "scenario1":
                res.render('messaging1', {title: 'Emergency Response Planning'});
                break;
            case "submitplan1":
                res.render('submitplan1', {title: 'Emergency Response Planning'});
                break;
            case "scenario2info":
                res.render('scenario2', {title: 'Emergency Response Planning'});
                break;
            case "scenario2":
                res.render('messaging2', {title: 'Emergency Response Planning'});
                break;
            case "submitplan2":
                res.render('submitplan2', {title: 'Emergency Response Planning'});
                break;
            case "endpage":
                res.render('endpage', {title: 'Emergency Response Planning'});
                break;
            default: // we should in theory never get here
                res.redirect('/loginhome');
        }
    })
}

// function determineLocation(chatsystem, confirm, currentpage) { // if confirm === false then we are determining where we should redirect user,
//     var returnobject;                                          // otherwise we are confirming if this is the correct page location
//     switch (chatsystem.location) {
//         case "scenario1info":
//             if (confirm & ("scenario1info" !== currentpage)) {
//                 return determineLocation(chatsystem, false, currentpage); // we need to redirect the user then
//             } else {
//                 return checkScenarioInfo(chatsystem, confirm);
//             }
//         case "scenario1":
//             if (confirm & ("scenario1" !== currentpage)) {
//                 return determineLocation(chatsystem, false, currentpage); // we need to redirect the user then
//             } else {
//                 return checkChat(chatsystem, confirm)
//             }
//             break;
//         case "submitplan1":
//             if (confirm) {
//                 return checkSubmit(chatsystem, confirm);
//             } else { // if we are determining where to send user
//                 returnobject = {'correct': 'false', 'redirect': '/submitplan1'};
//                 return returnobject;
//             }
//             break;
//         case "scenario2info":
//             if (confirm & ("scenario2info" !== currentpage)) {
//                 return determineLocation(chatsystem, false, currentpage); // we need to redirect the user then
//             } else {
//                 return checkScenarioInfo(chatsystem, confirm);
//             }
//             break;
//         case "scenario2":
//             if (confirm & ("scenario2" !== currentpage)) {
//                 return determineLocation(chatsystem, false, currentpage); // we need to redirect the user then
//             } {
//                 return checkChat(chatsystem, confirm);
//             }
//             break;
//         case "submitplan2":
//             if (confirm) {
//                 return checkSubmit(chatsystem, confirm);
//             } else { // if we are determining where to send user
//                 returnobject = {'correct': 'false', 'redirect': '/submitplan2'};
//                 return returnobject;
//             }
//             break;
//         case "endpage":
//             returnobject = {'correct': 'false', 'redirect': '/endpage'};
//             return returnobject; // this is where I should send the user to the final page
//             break;
//         default: // we should in theory never get here
//             returnobject = {'correct': 'false', 'redirect': '/loginhome'};
//             return returnobject;
//     }
// }


router.post('/getScenarioInfo', function(req, res) {
    var currentTime, msAge, redirect, timeleft, returnobject, redirect;
    ChatSystem
    .findOne({"id": req.user.systemID})
    .exec(function (err, chatsystem) {
        if (err) {
          console.log('An error occurred');
        } 
        currentTime = getCurrentTime();
        msAge = currentTime - chatsystem.sectionTime;
        if (msAge > maxScenarioTime) {
            if (chatsystem.location === "scenario1info") {
                chatsystem.location = "scenario1";
                redirect = "/messaging1";
                chatsystem.scenario1.startTime = getCurrentTime();
            } else {
                chatsystem.location = "scenario2";
                redirect = "/messaging2";
                chatsystem.scenario2.startTime = getCurrentTime();
            }
            chatsystem.sectionTime = "none"; // the chat room object keeps track of time
            chatsystem.save();
            returnobject = {'correct': 'false', 'redirect': redirect};
            res.send(returnobject);
        } else {
            timeleft = maxScenarioTime - msAge;
            returnobject = {'correct': 'true', 'timeleft': timeleft, 'system': chatsystem.id, 'userID': req.user.id};
            res.send(returnobject);
        }
    })
}

function checkChat(chatsystem, confirm) {
    var currentTime, msAge, chatroom, redirect, returnobject;
    if (chatsystem.location === "scenario1") {
        chatroom = chatsystem.scenario1;
    } else {
        chatroom = chatsystem.scenario2;
    }
    currentTime = getCurrentTime();
    msAge = currentTime - chatroom.startTime;
    if (msAge >= maxAgeChat){
        chatroom.completed = true;
        chatroom.active = false;
        chatroom.save();
        if (chatsystem.location === "scenario1") {
            chatsystem.location = "submitplan1";
            returnobject = {'correct': 'false', 'redirect': "/submitplan1"};
        } else {
            chatsystem.location = "submitplan2";
            returnobject = {'correct': 'false', 'redirect': "/submitplan2"};
        }
        chatsystem.sectionTime = getCurrentTime();
        chatsystem.save();
        return returnobject;
    } else {
        if (confirm) { // if here this is the correct page
            if (chatsystem.location === "scenario1") {
                return getChat(chatsystem.scenario1.id)
            } else {
                return getChat(chatsystem.scenario2.id);
            }
        } else { // if we are determining where to send user
            if (chatsystem.location === "scenario1") {
                returnobject = {'correct': 'false', 'redirect':'/messaging1'};
            } else {
                returnobject = {'correct': 'false', 'redirect':'/messaging2'};
            }
            return returnobject;
        }
    }
}
// Get conversation start time and previous messages if there are any
function getChat(roomid) {
    var currentTime, msAge, timeleft, returnobject;
    ChatRoom
    .findOne({"id": roomid})
    .populate({path: 'Conversation', options:{sort: {'timeCreated': 1}}})
    .exec(function (err, chatroom) {
        if (err) return handleError(err);
        currentTime = getCurrentTime();
        msAge = currentTime - chatroom.startTime;
        timeleft = maxAgeChat - msAge;
        returnobject = {'correct': 'true', 'room': chatroom, 'timeleft': timeleft};
        return returnobject;
    })
};

function checkSubmit(chatsystem, confirm) {
    var currentTime, msAge, returnobject;
    currentTime = getCurrentTime();
    msAge = currentTime - chatsystem.sectionTime;
    if (msAge > maxSubmitTime) {
        if (chatsystem.location === "submitplan1") {
            chatsystem.location = "scenario2info";
            returnobject = {'correct': 'false', 'redirect': "/scenario2"};
            chatsystem.sectionTime = getCurrentTime();
        } else {
            chatsystem.location = "endpage";
            returnobject = {'correct': 'false', 'redirect': "/endpage"};
            chatsystem.sectionTime = "none";
        }
        chatsystem.save();
        return returnobject;
    } else {
        if (confirm) { // If here this is the correct page, am going to want time left
            timeleft = maxSubmitTime - msAge;
            returnobject = {'correct': 'true', 'timeleft': timeleft};
            return returnobject;
        } else { // if we are determining where to send user
            if (chatsystem.location === "submitplan1") {
                returnobject = {'correct': 'false', 'redirect':'/submitplan1'};
            } else {
                returnobject = {'correct': 'false', 'redirect':'/submitplan2'};
            }
            return returnobject;
        }
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////
// Submit plan backend

router.post('/addPlan', function(req, res) {
    var plan = JSON.parse(req.body.plan);
    var name = req.body.name;
    var system = req.body.system;
    var userid = req.body.userid;
    var plannumber;
    var system;
    function createStepUAV(step, act, loc, chat) {
        var plan_step = new Plan({
            user:            userid,
            name:            name,
            stepnumber:      step,
            action:          act,
            location:        loc
        })
        plan_step.save();
        if(plannumber === 1) {
            chat.user1plan.push(plan_step);
        } else {
            chat.user2plan.push(plan_step);
        }
    }
    function createStepMissile(count, missile, target, chat) {
        var plan_step = new Plan({
            user:            userid,
            name:            name,
            count:           count,
            missle:          missile,
            target:          target
        })
        plan_step.save();
        if(plannumber === 1) {
            chat.user1plan.push(plan_step);
        } else {
            chat.user2plan.push(plan_step);
        }
    }

    function enterPlan(roomid) {
        ChatRoom
        .findOne({"id": roomid})
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
            if (system.User1 === userid) {
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
                if (chat.type === "uav") {
                    createStepUAV(thisStep.stepnumber, thisStep.action, thisStep.location, chat);
                } else {
                    createStepMissile(thisStep.count, thisStep.missile, thisStep.target, chat)
                }
            }
            return chat;
        })
        .then(chat => {
            chat.save();
        })
        .then(() => {res.send('success')})
        .catch(error => { console.log(error) });
    }
    ChatSystem
    .findOne({"id": systemid})
    .populate('scenario1 scenario2')
    .exec(function (err, userchatsystem) {
        if (err) {
          console.log('An error occurred');
        } 
        system = userchatsystem;
        if (system.location === "submitplan1") {
            enterPlan(system.scenario1.id)
        } else {
            enterPlan(system.scenario2.id)
        }
    })
});

////////////////////////////////////////////////////////////////////////////////////////////////
// Sign Up and login stuff for admin users
router.post('/signup', function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var reenterpassword = req.body.reenterpassword;
    //to find if username
    User.findOne({'username': username}, function (err, users) {
      if (err) {
        console.log('An error occurred');
      }
      if(users != null){
        res.send("usernameTaken");
        return;
      } else {                    // Using as username
          User.register(new User({username: username}), password, function(err) {
            if (err) {
              console.log('error while user register!', err);
              return next(err);
            }
            User.findOne({username: username}, function (err, users) {
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
    res.send("loggedin");
  });

////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = router;
