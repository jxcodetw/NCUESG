var express = require('express');
var router = express.Router();
var Team = require('../models/team');
var User = require('../models/user');
var async = require('async');
var sanitize = require('../lib/sanitize');

router.get('/', function(req, res) {
  res.render('team', { user: req.user});
});

router.post('/updateinfo', function(req, res) {
  var teamId = req.body.teamId;
  var teamName = req.body.teamName;
  var teamIntro = req.body.teamIntro;
  if (req.isAuthenticated()) {
    Team.findById(teamId).populate('leader').exec(function(err, team) {
      if (team.leader.id == req.user.id) {
        team.name = teamName;
        team.intro = teamIntro;
        team.save(function(err, doc) {
          res.json({
            ok: true,
            msg: 'good'
          });
        });
      } else {
        res.json({
          ok: false,
          msg: 'you are not leader'
        });
      }
    });
  } else {
    res.json({
      ok: false,
      msg: 'login first'
    });
  }
});

router.get('/dashboard', isLoggedIn, function(req, res) {
  async.parallel(
    {
      lol: function(cb) {
        if (!req.user.local.teamLOL) {
          cb(null, false);
        } else {
          Team.findById(req.user.local.teamLOL).populate('leader').populate('member').exec(function(err, team) {
            cb(null, team);
          });
        }
      },
    },
    function(err, result) {
      res.render('dashboard', {
        user: req.user,
        team: result,
      });
    }
  );
});

router.get('/:id/unlink', isLoggedIn, function(req, res) {
  // check team same ?
});

router.get('/:id/edit', isLoggedIn, function(req, res) {
  Team.findById(req.params.id).populate('leader').populate('member').exec(function(err, team) {
    if (team.leader.id == req.user.id) {
      var gameToName = ['LOL', 'HS', 'SC', 'AVA'];
      var gameToBack = ['lol', 'hs', 'sc', 'ava'];
      res.render('teamedit', {
        user: req.user,
        teamId: team.id,
        gameType: team.game,
        backTag: gameToBack[team.game],
        gameName: gameToName[team.game],
        teamLeader: req.user.local.name,
        teamName: team.name,
        teamIntro: team.intro,
        teamMember: team.member
      });
    } else {
      res.redirect('/team/'+req.params.id);
    }
  });
});

router.post('/new', isLoggedIn, function(req, res) {
  // check if this user has joined req.body.gametype
  if (req.body.gametype == 0 && req.user.local.teamLOL) {
    res.redirect('/team/dashboard');
  } else if (req.body.gametype == 1 && req.user.local.teamHS) {
    res.redirect('/team/dashboard');
  } else if (req.body.gametype == 2 && req.user.local.teamSC) {
    res.redirect('/team/dashboard');
  } else if (req.body.gametype == 3 && req.user.local.teamAVA) {
    res.redirect('/team/dashboard');
  } else if (req.body.gametype >= 0 && req.body.gametype <= 3) {
    // check activate code
    var newTeam = new Team();
    newTeam.name = sanitize(req.body.teamName);
    newTeam.game = req.body.gametype;
    newTeam.intro = sanitize(req.body.teamIntro);
    newTeam.leader = req.user;
    newTeam.save(function(err, team) {
      User.findById(req.user.id, function(err, doc) {
        doc.local.teamLOL = team;
        doc.save(function(err, user) {
          res.redirect('/team/dashboard');
        });
      });
    });
  }
});

router.post('/addmember', isLoggedIn, function(req, res) {
  var teamId = req.body.teamId;
  var email = req.body.email;
  console.log(email);
  User.findOne({'local.email': email}, function(err, user) {
    if (!user) {
      res.json({ok:false, msg: 'user not found'});
      return;
    }
    Team.findById(teamId).populate('leader').exec(function(err, team) {
      var response = {};
      response.ok = false;
      if (team.leader.id != req.user.id) {
        response.msg = 'you are not leader';
        res.json(response);
      } else {
        if (team.game == 0 && user.local.teamLOL)  {
          response.msg = 'Already joined';
          res.json(response);
        } else if (team.game == 1 && user.local.teamHS) {
          response.msg = 'Already joined';
          res.json(response);
        } else if (team.game == 2 && user.local.teamSC) {
          response.msg = 'Already joined';
          res.json(response);
        } else if (team.game == 3 && user.local.teamAVA) {
          response.msg = 'Already joined';
          res.json(response);
        } else {
          switch(team.game) {
            case 0:
              user.local.teamLOL = team;break;
            case 1:
              user.local.teamHS = team;break;
            case 2:
              user.local.teamSC = team;break;
            case 3:
              user.local.teamAVA = team;break;
          }
          user.save(function(err, doc) {
            team.addMember(doc, function() {
              response.ok = true;
              response.msg = 'done';
              res.json(response);
            })
          });
        }
      }
    });
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
}

module.exports = router;
