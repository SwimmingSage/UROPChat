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
    res.render('loginhome', {user: req.user, title: 'AI Monitoring of Human Team Planning Conversations'});
  } else {
    res.redirect('/');
  }
});

router.get('/messaging', function(req, res, next) {
  if(req.isAuthenticated()) {
    res.render('messaging', {user: req.user, title: 'AI Monitoring of Human Team Planning Conversations'});
  } else {
    res.redirect('/');
  }
});

// Gets the user data to the frontend for some pages where this is nice to have
router.get('/getUser', function(req, res) {
  res.send(req.user);
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
