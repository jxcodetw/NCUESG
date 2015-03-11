var express = require('express');
var router = express.Router();
var async = require('async');
var Announcement = require('../models/announcement');
var Team = require('../models/team');
var User = require('../models/user');

module.exports = function(passport) {
  router.get('/', function(req, res) {
    // async wait for all task to be done.
    async.parallel(
      {
        lolTeamsCount: function(cb) {
          Team.count({'game':0}).exec(function(err, team) {
            cb(null, team);
          });
        },
        hsTeamsCount: function(cb) {
          Team.count({'game':1}).exec(function(err, team) {
            cb(null, team);
          });
        },
        sc2TeamsCount: function(cb) {
          Team.count({'game':2}).exec(function(err, team) {
            cb(null, team);
          });
        },
        avaTeamsCount: function(cb) {
          Team.count({'game':3}).exec(function(err, team) {
            cb(null, team);
          });
        },
        userCount: function(cb) {
          User.count({}).exec(function(err, c) {
            cb(null,c);
          });
        },
        important: function(cb) {
          Announcement.find({'level': 1}).sort({created: 'desc'}).limit(5).exec(function(err, ann) {
            cb(null, ann);
          });
        },
        normal: function(cb) {
          Announcement.find({'level': 0}).sort({created: 'desc'}).limit(5).exec(function(err, ann) {
            cb(null, ann);
          });
        }
      },
      function(err, result) {
        res.render('index', {
          title: '',
          user: req.user,
          announcement_important: result.important,
          announcement_normal: result.normal,
          userCount: result.userCount,
          lolTeamsCount: result.lolTeamsCount,
          hsTeamsCount: result.hsTeamsCount,
          sc2TeamsCount: result.sc2TeamsCount,
          avaTeamsCount: result.avaTeamsCount
        });
      }
    );
  });

  router.get('/sponsors', function(req, res) {
    res.render('sponsors', {
      title: '贊助商',
      user: req.user
    });
  });

  router.get('/awards', function(req, res) {
    res.render('awards', {
      title: '參賽獎勵',
      user: req.user
    });
  });

  router.get('/rules/lol', function(req, res) {
    res.render('rules_lol', {
      title: '大賽規則-英雄聯盟',
      user: req.user
    });
  });
  router.get('/rules/hs', function(req, res) {
    res.render('rules_hs', {
      title: '大賽規則-爐石戰記',
      user: req.user
    });
  });
  router.get('/rules/sc2', function(req, res) {
    res.render('rules_sc2', {
      title: '大賽規則-星海爭霸2 蟲族之心',
      user: req.user
    });
  });
  router.get('/rules/ava', function(req, res) {
    res.render('rules_ava', {
      title: '大賽規則-A.V.A 戰地之王',
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
    failureFlash: 'Invalid username or password.'
  }));

  router.get('/register', isLoggedIn, function(req, res) {
    res.render('register', {
      error: req.flash('signupMessage')
    });
  });

  router.post('/register', isLoggedIn, passport.authenticate('local-signup', {
    successRedirect: '/',
    failureRedirect: '/register',
    failureFlash: true
  }));

  router.get('/live', function(req, res) {
    res.render('live', {
      user: req.user
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
