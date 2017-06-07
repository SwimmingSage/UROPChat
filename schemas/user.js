var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
  // I think User.plugin(passportLocalMongoose takes care of this username: {type: String, required: true, index: {unique: true}},
    firstname:              {type: String , required: true},
    lastname:               {type: String , required: true},
    email:                  {type: String , required: true, index: {unique: true}},
    chat_room:              {type: String},
    admin:                  {type: Boolean, default: false},
    id:                     {type: String},
});

var messageschema = new Schema({
    message:                {type: String, required: true},
    timeCreated:            {type: Number, required: true},
});

var chatroomschema = new Schema({
    Users:                  [{type: Schema.Types.ObjectId , ref: 'User'}],
    Conversation:           [{type: Schema.Types.ObjectId, ref: 'Message'}],
    id:                     {type: String},
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);
mongoose.model('Message', messageschema);
mongoose.model('ChatRoom', chatroomschema);

// var Message = mongoose.model('Message', messageschema);
// var ChatRoom = mongoose.model('ChatRoom', chatroomschema);