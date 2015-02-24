var express = require('express');
var router = express.Router();
var Team = require('../models/team');
var User = require('../models/user');
var async = require('async');
var sanitize = require('../lib/sanitize');
var authTeam;

var gameList = [
  "英雄聯盟",
  "爐石戰記：魔獸英雄傳",
  "星海爭霸II：蟲族之心",
  "AVA戰地之王"
];

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
        sc2Teams: result.scTeams,
        avaTeams: result.avaTeams
      });
    }
  );
});

router.get('/:id/unlink', isLoggedIn, function(req, res) {
  // kick myself
  Team.findById(req.params.id).populate('leader').populate('member').exec(function(err, team) {
    if (err || !team || team.leader.id == req.user.id) {
      res.redirect('/team/dashboard');
      return;
    }
    var index = -1;
    for(var i = 0; i < team.member.length; ++i) {
      if (team.member[i].id == req.user.id) {
        index = i;
        break;
      }
    }
    if (index > -1) {
      team.member.splice(index, 1);
    }
    team.markModified('member');
    team.save();
    User.findById(req.user.id, function(err, doc) {
      doc.local.team[team.game] = null;
      doc.markModified('local.team');
      doc.save();
      res.redirect('/team/dashboard');
    });
  });
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
  authTeam.name = sanitize(req.body.name);
  authTeam.intro = sanitize(req.body.intro);
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
      sc2: function(cb) {
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
      team:team,
      gameToName: gameList
    });
  });
});

router.post('/:id/kick', isLoggedIn, isAdmin, function(req, res) {
  User.findById(req.body.target, function(err, doc) {
    var index = -1;
    for(var i = 0; i < authTeam.member.length; ++i) {
      if (authTeam.member[i].id == doc.id) {
        index = i;
        break;
      }
    }
    if (index > -1) {
      authTeam.member.splice(index, 1);
    }
    authTeam.markModified('member');
    authTeam.save();
    doc.local.team[authTeam.game] = null;
    doc.markModified('local.team');
    doc.save(function(err, user) {
      res.json({
        ok: true,
        msg: '成功將隊員退出組隊'
      });
    });
  });
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

router.post('/:id/addmember', isLoggedIn, isAdmin, function(req, res) {
  User.findOne({'local.email': req.body.email}, function(err, user) {
    if (err || !user) {
      res.json({ok:false, msg: '找不到該使用者'});
      return;
    }
    if (user.local.team[authTeam.game] != null) {
      res.json({ok:false, msg: '該玩家在同一個遊戲中已經有加入其他隊伍'});
      return;
    }
    var full = authTeam.isFull();
    if (full != false) {
      res.json({ok:false, msg: full});
      return;
    }
    user.local.team[authTeam.game] = authTeam.id;
    user.markModified('local.team');
    authTeam.member.push(user);
    user.save();
    authTeam.save();
    res.json({
      ok:true, 
      msg:'隊員加入成功',
      addedUser: {
        id: user.id,
        name: user.local.name,
        email: user.local.email
      }
    });
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
}

function isAdmin(req, res, next) {
  Team.findById(req.params.id).populate('leader').populate('member').exec(function(err, team) {
    if (err || !team) {
      res.redirect('/team/dashboard');
      return;
    }
    if (team.leader.id == req.user.id || req.user.local.level >= 10) {
      authTeam = team;
      return next();
    } else {
      res.redirect('/team/dashboard');
    }
  });
}

module.exports = router;
