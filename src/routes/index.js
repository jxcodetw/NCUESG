var express = require('express');
var router = express.Router();
var Announcement = require('../models/announcement');

module.exports = function(passport) {
  router.get('/', function(req, res) {
    var important;
    var normal;
    Announcement.find({'level': {$gt: 0}}).sort({created: 'desc'}).limit(5).exec(function(err, ann) {
      important = ann;
      Announcement.find({level: {$lt: 1}}, function(err, ann) {
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
      title: '登入',
      type: 'login',
      error: req.flash('loginMessage')
    });
  });

  router.post('/login', isLoggedIn, passport.authenticate('local-login', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  }));

  router.get('/register', isLoggedIn, function(req, res) {
    res.render('login', {
      title: '註冊',
      type: 'register'
    });
  });

  router.post('/register', isLoggedIn, passport.authenticate('local-signup', {
    successRedirect: '/',
    failureRedirect: '/register',
    failureFlash: true
  }));

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
