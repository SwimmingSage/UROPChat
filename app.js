var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

// for passport 
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('./schemas/user.js');

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// end of passport code

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();


// // This code in these 3 lines is all for the socket.io
// var http = require('http').Server(app);
// // Initialize a socket object from socket.io
// var io = require('socket.io')(http);

//more passport code
app.use(session({ secret: 'my super secret secret', resave: 'false', saveUninitialized: 'true' }));
app.use(passport.initialize());
app.use(passport.session());

//end of more passport code

// set up for mongodb copied from mongodb-solutions in class with substitution of mongolab
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/test');
var connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'connection error:'));
connection.on('connected', function() {
  console.log('database connected!');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



// io.on('connection', function(socket) {
//   console.log('a user connected');

//   // When a user disconnects from out app...
//   socket.on('disconnect', function() {
//     console.log('a user disconnected');
//   });

//   // When the server receives a 'chat message' message from
//   // a single user
//   socket.on('chat message', function(msg) {
//     console.log('message:', msg);

//     // Emit that message to all users currently connected
//     // to our app
//     io.emit('chat message', msg);
//   });
// });

//require('./scheduled_job.js');

module.exports = app;