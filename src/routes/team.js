var express = require('express');
var router = express.Router();
var Team = require('../models/team');
var User = require('../models/user');
var async = require('async');
var sanitize = require('../lib/sanitize');
var authTeam;

router.get('/', function(req, res) {
  // async wait for all task to be done.
  async.parallel(
    {
      lolTeams: function(cb) {
        Team.find({'game':0}).populate('leader').populate('member').exec(function(err, team) {
          cb(null, team);
        });
      },
      hsTeams: function(cb) {
        Team.find({'game':1}).populate('leader').populate('member').exec(function(err, team) {
          cb(null, team);
        });
      },
      scTeams: function(cb) {
        Team.find({'game':2}).populate('leader').populate('member').exec(function(err, team) {
          cb(null, team);
        });
      },
      avaTeams: function(cb) {
        Team.find({'game':3}).populate('leader').populate('member').exec(function(err, team) {
          cb(null, team);
        });
      },
    },
    function(err, result) {
      res.render('teams', {
        user: req.user,
        lolTeams: result.lolTeams,
        hsTeams: result.hsTeams,
        scTeams: result.scTeams,
        avaTeams: result.avaTeams
      });
    }
  );
});

router.get('/new', isLoggedIn, function(req, res) {
  var game = req.query.gametype;
  var gametype = 0;
  if (game === 'hs') gametype = 1;
  else if (game === 'sc2') gametype = 2;
  else if (game === 'ava') gametype = 3;
  res.render('team_new', {
    user: req.user,
    game: gametype
  });
});


router.post('/:id/edit', isLoggedIn, isAdmin, function(req, res) {
  authTeam.name = req.body.name;
  authTeam.intro = req.body.intro;
  authTeam.save();
  res.redirect('/team/dashboard');
});

router.get('/dashboard', isLoggedIn, function(req, res) {
  async.parallel(
    {
      lol: function(cb) {
        if (req.user.local.team[0] == null) {
          cb(null, false);
        } else {
          Team.findById(req.user.local.team[0]).populate('leader').populate('member').exec(function(err, team) {
            cb(null, team);
          });
        }
      },
      hs: function(cb) {
        if (req.user.local.team[1] == null) {
          cb(null, false);
        } else {
          Team.findById(req.user.local.team[1]).populate('leader').populate('member').exec(function(err, team) {
            cb(null, team);
          });
        }
      },
      sc: function(cb) {
        if (req.user.local.team[2] == null) {
          cb(null, false);
        } else {
          Team.findById(req.user.local.team[2]).populate('leader').populate('member').exec(function(err, team) {
            cb(null, team);
          });
        }
      },
      ava: function(cb) {
        if (req.user.local.team[3] == null) {
          cb(null, false);
        } else {
          Team.findById(req.user.local.team[3]).populate('leader').populate('member').exec(function(err, team) {
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

router.get('/:id', isLoggedIn, function(req, res) {
  Team.findById(req.params.id).populate('leader').populate('member').exec(function(err, team) {
    res.render('team', {
      user: req.user,
      team:team
    });
  });
});

router.get('/:id/unlink', isLoggedIn, function(req, res) {
  // check team same ?
});

router.get('/:id/edit', isLoggedIn, isAdmin, function(req, res) {
  var gameToName = ['英雄聯盟', '爐石戰記', '星海爭霸2-蟲族之心', '戰地之王'];
  res.render('team_edit', {
    user: req.user,
    team: authTeam,
    gameName: gameToName[authTeam.game],
  });
});

router.post('/new', isLoggedIn, function(req, res) {
  // check if this user has joined req.body.gametype
  if (req.user.local.team[req.body.gametype] != undefined) {
    res.redirect('/team/dashboard');
  } else if (req.body.gametype >= 0 && req.body.gametype <= 3) {
    // check activate code
    var newTeam = new Team();
    newTeam.name = sanitize(req.body.name);
    newTeam.game = req.body.gametype;
    newTeam.intro = sanitize(req.body.intro);
    newTeam.leader = req.user;
    newTeam.save(function(err, team) {
      User.findById(req.user.id, function(err, doc) {
        doc.local.team[team.game] = team._id;
        doc.markModified('local.team');
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
  User.findOne({'local.email': email}, function(err, user) {
    if (err || !user) {
      res.json({ok:false, msg: 'user not found'});
      return;
    }
    Team.findById(teamId).populate('leader').exec(function(err, team) {
      var isfull = team.isFull();
      if (err || !team) {
        res.json({ok:false, msg: 'team not found'});
        return;
      }
      if (team.leader.id != req.user.id) {
        res.json({ok:false, msg: 'you are not leader'});
        return;
      }
      if (user.local.team[team.game] != null) {
        res.json({ok:false, msg: 'already joined a team'});
        return;
      }
      if (isfull != false) {
        res.json({ok:false, msg: isfull});
        return;
      }
      user.local.team[team.game] = team._id;
      user.markModified('local.team');
      team.member.push(user);
      user.save();
      team.save();
      res.json({
        ok:true, 
        msg:'done',
        row:'<tr><td>' + user.local.name + '</td><td>' + user.local.email + '</td></tr>'
      });
    });
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
}

function isAdmin(req, res, next) {
  if (req.user.local.level > 10) {
    return next();
  }
  Team.findById(req.params.id).populate('leader').exec(function(err, team) {
    if (team.leader.id == req.user.id) {
      authTeam = team;
      return next();
    } else {
      res.redirect('/team/dashboard');
    }
  });
}

module.exports = router;
