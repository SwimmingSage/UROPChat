var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    // Passport takes care of username and password
    // our users will user their userid to login
    id:                     {type: String}, // defined upon creation
    name:                   {type: String}, // defined later
    systemID:               {type: String, default: "none"}, // defined upon creation
    admin:                  {type: Boolean, default: false}, // defined upon creation
    complete:               {type: Boolean, default: false}, // defined upon creation
});

var messageschema = new Schema({
    message:                {type: String, required: true},
    timeCreated:            {type: Number, required: true},
    sender:                 {type: String, required: true},
    idofSender:             {type: String, required: true},
});

var planschema = new Schema({
    user:                   {type: String},
    name:                   {type: String},
    // for UAV Problem
    stepnumber:             {type: Number, default: 0}, // when populating these I sort by step number,
    action:                 {type: String},             // so it's needed for both, but only relevant to UAV
    location:               {type: String},
    // for Missile Problem
    count:                  {type: Number},
    missile:                {type: String},
    target:                 {type: String}
});

var chatroomschema = new Schema({
    type:                   {type: String, enum: ["uav", "missile"]},
    Conversation:           [{type: Schema.Types.ObjectId, ref: 'Message'}],
    id:                     {type: String},
    startTime:              {type: String},
    active:                 {type: Boolean, default: false},
    completed:              {type: Boolean, default: false},
    user1plan:              [{type: Schema.Types.ObjectId, ref: 'Plan'}],
    user2plan:              [{type: Schema.Types.ObjectId, ref: 'Plan'}],
});

var chatsystemschema = new Schema({
    User1:                  {type: String},
    User2:                  {type: String},
    id:                     {type: String},
    sectionTime:            {type: String, default: "none"},
    location:               {type: String, default: "none"},
    complete:               {type: Boolean, default: false},
    available:              {type: Boolean, default: true},
    scenario1:              {type: Schema.Types.ObjectId, ref: 'ChatRoom'},
    scenario2:              {type: Schema.Types.ObjectId, ref: 'ChatRoom'}
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);
mongoose.model('Message', messageschema);
mongoose.model('Plan', planschema);
mongoose.model('ChatRoom', chatroomschema);
mongoose.model('ChatSystem', chatsystemschema);

