var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');

var taskschema = new Schema({
    achieved : { type: Boolean },
    name     : { type: String, default: "" },
    points   : { type: Number, default: 0 },
})


var goalschema = new Schema({
    goal_type:         { type: String, enum: ["loseweightgoal", "breakhabitgoal", "formhabitgoal", "learnskillgoal", "fitnessgoal", "uniquegoal"]},
    goal_name:         { type: String },
    current_weight:    { type: String, default: "NA" },
    weight_to_lose:    { type: String, default: "NA" },
    streak:            { type: Number },
    task_achieved:     { type: Boolean},
    tasks:             [taskschema],
});


var User = new Schema({
  // I think User.plugin(passportLocalMongoose takes care of this username: {type: String, required: true, index: {unique: true}},
  email:                  {type: String, required: true, index: {unique: true}},
  firstname:              {type: String, required: true},
  lastname:               {type: String, required: true},
  points:                 {type: Number, required: true},
  points_to_levelup:      {type: Number, required: true},
  level:                  {type: Number, required: true},
  goals:                  [goalschema],
  goals_achieved:         [goalschema],
  goals_to_delete:        {type: Number, default: 3},
});


User.plugin(passportLocalMongoose);

mongoose.model('User', User);
mongoose.model("goal", goalschema);
mongoose.model("tasks", taskschema);


module.exports = mongoose.model('User', User);