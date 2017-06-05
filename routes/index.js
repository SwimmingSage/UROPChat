var express = require('express');
var router = express.Router();

var router = require('express').Router();
var mongoose = require('mongoose')

var User = mongoose.model('User');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'AI Monitoring of Human Team Planning Conversations' });
});

module.exports = router;
