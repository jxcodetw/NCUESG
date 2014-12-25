var express = require('express');
var router = express.Router();
var Team = require('../models/team');
var User = require('../models/user');

router.get('/', isLoggedIn, function(req, res) {
  User.find().populate('team').exec(function(err, users) {
    res.render('users', {
      user: req.user,
      users: users
    });
  });
});

router.get('/:id', function(req, res) {
  User.findById(req.params.id).populate('local.team').exec(function(err, user) {
    res.render('user', { user: user });
  });
});

router.get('/:id/edit', isEditable, function(req, res) {
  res.render('useredit', {user: req.user})
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
}

function isEditable(req, res, next) {
  if (req.isAuthenticated() && req.user.id == req.params.id || (req.user && req.user.level > 10))
    return next();
  res.redirect('/user/' + req.params.id);
}

module.exports = router;
