var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
  // I think User.plugin(passportLocalMongoose takes care of this username: {type: String, required: true, index: {unique: true}},
    firstname:              {type: String , required: true},
    lastname:               {type: String , required: true},
    email:                  {type: String , required: true, index: {unique: true}},
    accessible_chat_rooms:  {type: Array  , required: false},
    admin:                  {type: Boolean, default: false},
});

var chatroomschema = new Schema({
    
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);