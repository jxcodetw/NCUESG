var express = require('express');
var router = express.Router();
var Team = require('../models/team');
var User = require('../models/user');
var async = require('async');
var sanitize = require('../lib/sanitize');

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


router.post('/updateinfo', function(req, res) {
  var teamId = req.body.teamId;
  var teamName = req.body.teamName;
  var teamIntro = req.body.teamIntro;
  if (!req.isAuthenticated()) {
    res.json({
      ok: false,
      msg: 'login first'
    });
    return;
  }
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
  if (req.user.local.team[req.body.gametype] != undefined) {
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

module.exports = router;
