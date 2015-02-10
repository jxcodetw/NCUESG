var express = require('express');
var router = express.Router();
var Announcement = require('../models/announcement');
var User = require('../models/user');
var sanitize = require('../lib/sanitize');

module.exports = function(passport) {
  router.get('/', function(req, res) {
    // get some announcements
    var important;
    var normal;
    Announcement.find({'level': {$gt: 0}}).sort({created: 'desc'}).limit(5).exec(function(err, ann) {
      important = ann;
      Announcement.find({'level': {$lt: 1}}, function(err, ann) {
        normal = ann;
        res.render('index', {
          title: '',
          user: req.user,
          announcement_important: important,
          announcement_normal: normal
        });
      });
    });
  });

  router.get('/sponsors', function(req, res) {
    res.render('sponsors', {
      title: '贊助商',
      user: req.user
    });
  });

  router.get('/rules', function(req, res) {
    res.render('rules', {
      title: '大賽規則',
      user: req.user
    });
  });

  router.get('/participation_help', function(req, res) {
    res.render('participation_help', {
      title: '報名須知',
      user: req.user
    });
  });

  router.get('/contact', function(req, res) {
    res.render('contact', {
      title: '問題舉報',
      user: req.user
    });
  });

  router.get('/login', isLoggedIn, function(req, res) {
    res.render('login', {
      error: req.flash('loginMessage')
    });
  });

  router.post('/login', isLoggedIn, passport.authenticate('local-login', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  }));

  router.get('/register', isLoggedIn, function(req, res) {
    res.render('register');
  });

  router.post('/register', isLoggedIn, function(req, res) {
    var email = req.body.email, password = req.body.password;
    if (email)
      email = email.toLowerCase();
    process.nextTick(function() {
      User.findOne({'local.email': email}, function(err, user) {
        if (err) {
          res.json({error: 1, msg: 'unknown error'});
          return;
        }
        
        if (user) {
          res.json({error: 1, msg: '已有相同帳號被註冊'});
          return;
        } else if (password == req.body.password2) {
          var newUser = new User();
          newUser.local.email = sanitize(email);
          newUser.local.password = newUser.generateHash(password);
          newUser.local.name = sanitize(req.body.name);
          newUser.local.studentid = sanitize(req.body.studentid);
          newUser.local.phone = sanitize(req.body.phone);
          newUser.local.department = sanitize(req.body.department);
          newUser.local.grade = sanitize(req.body.grade);
          newUser.local.level = 0;
          newUser.local.team = [null, null, null, null];
          newUser.local.created = new Date();

          newUser.save(function(err) {
            if (err) {
              console.log(err);
              res.json({error: 1, msg: '不知名錯誤'});
              return;
            } else {
              res.json({error: 0, msg: 'done'});
              return;
            }
          });
        } else {
          res.json({error: 0, msg: '兩次輸入的密碼不相符'});
          return;
        }
      });
    });
  });

  router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  return router;
}

function isLoggedIn(req, res, next) {
  // if login then redirect
  if (req.isAuthenticated())
    res.redirect('/');
  return next();
}
