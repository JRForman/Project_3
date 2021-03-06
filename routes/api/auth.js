var mongoose = require('mongoose');
var passport = require('passport');
var settings = require('../../config/settings');
require('../../config/passport')(passport);
var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
var db = require("../../models");


// Should get rid of password before sending down to user. they do not need it
router.get("/user/:id", (req, res) => {
  db.User.findById(req.params.id).then(user => {
    console.log(user);
    res.send(user);
  });
})

router.post('/signup', function(req, res) {
  console.log(req.body)
  if (!req.body.username || !req.body.password) {
    res.json({success: false, msg: 'Please pass username and password.'});
  } else {
    var newUser = new db.User({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      zipCode: req.body.zipCode,
      petName: req.body.petName
    });
    // save the user
    newUser.save(function(err,dbUser) {
      if (err) {
        console.log(err);
        return res.json({success: false, msg: 'Username already exists.'});
      }
      res.json({success: true, msg: 'Successful created new user.', id: dbUser._id});
    });
  }
});

router.post('/login', function(req, res) {
  console.log(req.body)
  db.User.findOne({
    username: req.body.username
  }, function(err, user) {
    if (err) throw err;

    if (!user) {
      res.status(401).send({success: false, msg: 'Authentication failed. User not found.'});
    } else {
      // check if password matches
      user.comparePassword(req.body.password, function (err, isMatch) {
        console.log(isMatch)
        if (isMatch && !err) {
          // if user is found and password is right create a token
          var token = jwt.sign(user.toJSON(), settings.secret);
          // return the information including token as JSON
          res.json({success: true, token: 'JWT ' + token});
        } else {
          res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.',result});
        }
      });
    }
  });
});

module.exports = router;
