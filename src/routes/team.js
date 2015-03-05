var express = require('express');
var fs = require('fs');
var router = express.Router();
var Team = require('../models/team');
var User = require('../models/user');
var Code = require('../models/code');
var async = require('async');
var sanitize = require('../lib/sanitize');
var multer = require('multer');
var maxFileSize = 1024*1024;

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
    game: gametype,
    errorMessage: req.flash('newteamMessage')
  });
});


var uploadHead = multer({
  dest: './public/uploads',
  onFileUploadStart: function (file, req, res) {
    console.log(file.fieldname + ' is starting ...');
    if (file.extension != 'jpg' &&
        file.extension != 'jpeg' &&
        file.extension != 'png' &&
        file.extension != 'bmp') {
      console.log(file.filename + ' upload failed. incorrect file extension.')
      req.uploadedName = "";
      return false;
    }
  },
  onFileUploadComplete: function (file, req, res) {
    req.uploadedName = file.name;
    console.log(file.fieldname + ' uploaded to  ' + file.path);
  }
});

router.post('/:id/edit', isLoggedIn, isAdmin, uploadHead, function(req, res) {
  req.authTeam.name = sanitize(req.body.name);
  req.authTeam.intro = sanitize(req.body.intro);
  if (req.uploadedName != undefined) {
    req.authTeam.head = req.uploadedName;
  }
  req.authTeam.tryout = Array.apply(null, Array(48)).map(function() {return false;});
  req.authTeam.intermediary = Array.apply(null, Array(40)).map(function() {return false;});
  var tryout = req.body.tryout;
  var intermediary = req.body.intermediary;
  for(var key in tryout) {
    req.authTeam.tryout[tryout[key]] = true;
  }
  for(var key in intermediary) {
    req.authTeam.intermediary[intermediary[key]] = true;
  }
  req.authTeam.markModified('tryout');
  req.authTeam.markModified('intermediary');
  req.authTeam.save(function(err) {
    if (err && err.code == 11000) {
      req.flash('editTeamErrorMessage', '隊伍名稱重複了');
    } else {
      req.flash('editTeamMessage', '修改成功');
    }
    res.redirect('/team/' + req.params.id + '/edit');
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
  Team.findById(req.params.id).populate('leader').populate('member').populate('competitions').exec(function(err, team) {
    var options = {
      path: 'competitions.team1 competitions.team2',
      model: 'Team'
    };
    Team.populate(team, options, function(err, t) {
      res.render('team', {
        user: req.user,
        team: t,
        gameToName: gameList,
        times:  [
          "2015-03-23 18:00:00",
          "2015-03-23 19:00:00",
          "2015-03-23 20:00:00",
          "2015-03-23 21:00:00",
          "2015-03-23 22:00:00",
          "2015-03-23 23:00:00",
          "2015-03-24 18:00:00",
          "2015-03-24 19:00:00",
          "2015-03-24 20:00:00",
          "2015-03-24 21:00:00",
          "2015-03-24 22:00:00",
          "2015-03-24 23:00:00",
          "2015-03-25 18:00:00",
          "2015-03-25 19:00:00",
          "2015-03-25 20:00:00",
          "2015-03-25 21:00:00",
          "2015-03-25 22:00:00",
          "2015-03-25 23:00:00",
          "2015-03-26 18:00:00",
          "2015-03-26 19:00:00",
          "2015-03-26 20:00:00",
          "2015-03-26 21:00:00",
          "2015-03-26 22:00:00",
          "2015-03-26 23:00:00",
          "2015-03-27 18:00:00",
          "2015-03-27 19:00:00",
          "2015-03-27 20:00:00",
          "2015-03-27 21:00:00",
          "2015-03-27 22:00:00",
          "2015-03-27 23:00:00",
          "2015-03-28 18:00:00",
          "2015-03-28 19:00:00",
          "2015-03-28 20:00:00",
          "2015-03-28 21:00:00",
          "2015-03-28 22:00:00",
          "2015-03-28 23:00:00",
          "2015-03-29 18:00:00",
          "2015-03-29 19:00:00",
          "2015-03-29 20:00:00",
          "2015-03-29 21:00:00",
          "2015-03-29 22:00:00",
          "2015-03-29 23:00:00",
          "2015-03-30 18:00:00",
          "2015-03-30 19:00:00",
          "2015-03-30 20:00:00",
          "2015-03-30 21:00:00",
          "2015-03-30 22:00:00",
          "2015-03-30 23:00:00",
          "2015-03-31 18:00:00",
          "2015-03-31 19:00:00",
          "2015-03-31 20:00:00",
          "2015-03-31 21:00:00",
          "2015-03-31 22:00:00",
          "2015-03-31 23:00:00",
          "2015-04-01 18:00:00",
          "2015-04-01 19:00:00",
          "2015-04-01 20:00:00",
          "2015-04-01 21:00:00",
          "2015-04-01 22:00:00",
          "2015-04-01 23:00:00",
          "2015-04-02 18:00:00",
          "2015-04-02 19:00:00",
          "2015-04-02 20:00:00",
          "2015-04-02 21:00:00",
          "2015-04-02 22:00:00",
          "2015-04-02 23:00:00",
          "2015-04-04 18:00:00",
          "2015-04-04 19:00:00",
          "2015-04-04 20:00:00",
          "2015-04-04 21:00:00",
          "2015-04-04 22:00:00",
          "2015-04-04 23:00:00",
          "2015-04-05 18:00:00",
          "2015-04-05 19:00:00",
          "2015-04-05 20:00:00",
          "2015-04-05 21:00:00",
          "2015-04-05 22:00:00",
          "2015-04-05 23:00:00",
          "2015-04-07 18:00:00",
          "2015-04-07 19:00:00",
          "2015-04-07 20:00:00",
          "2015-04-07 21:00:00",
          "2015-04-07 22:00:00",
          "2015-04-07 23:00:00",
          "2015-04-08 18:00:00",
          "2015-04-08 19:00:00",
          "2015-04-08 20:00:00",
          "2015-04-08 21:00:00",
          "2015-04-08 22:00:00",
          "2015-04-08 23:00:00",
          "2015-04-09 18:00:00",
          "2015-04-09 19:00:00",
          "2015-04-09 20:00:00",
          "2015-04-09 21:00:00",
          "2015-04-09 22:00:00",
          "2015-04-09 23:00:00",
          "2015-04-11 18:00:00",
          "2015-04-11 19:00:00",
          "2015-04-11 20:00:00",
          "2015-04-11 21:00:00",
          "2015-04-11 22:00:00",
          "2015-04-11 23:00:00",
          "2015-04-12 18:00:00",
          "2015-04-12 19:00:00",
          "2015-04-12 20:00:00",
          "2015-04-12 21:00:00",
          "2015-04-12 22:00:00",
          "2015-04-12 23:00:00"
        ]
      });
    });
  });
});

router.post('/:id/kick', isLoggedIn, isAdmin, function(req, res) {
  User.findById(req.body.target, function(err, doc) {
    var index = -1;
    for(var i = 0; i < req.authTeam.member.length; ++i) {
      if (req.authTeam.member[i].id == doc.id) {
        index = i;
        break;
      }
    }
    if (index > -1) {
      req.authTeam.member.splice(index, 1);
    }
    req.authTeam.markModified('member');
    req.authTeam.save();
    doc.local.team[req.authTeam.game] = null;
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
  var gameToName = ['英雄聯盟', '爐石戰記', '星海爭霸2-蟲族之心', 'AVA戰地之王'];
  res.render('team_edit', {
    user: req.user,
    team: req.authTeam,
    gameName: gameToName[req.authTeam.game],
    editTeamMessage: req.flash('editTeamMessage'),
    editTeamErrorMessage: req.flash('editTeamErrorMessage'),
    tryout: [
      {index: 0, datetime: "3/23(一)"},
      {index: 1, datetime: "3/24(二)"},
      {index: 2, datetime: "3/25(三)"},
      {index: 3, datetime: "3/26(四)"},
      {index: 4, datetime: "3/27(五)"},
      {index: 5, datetime: "3/28(六)"},
      {index: 6, datetime: "3/29(日)"},
      {index: 7, datetime: "3/30(一)"},
      {index: 8, datetime: "3/31(二)"}
    ],
    tryout_times: [
      {index: 0, time: "18:00"},
      {index: 1, time: "19:00"},
      {index: 2, time: "20:00"},
      {index: 3, time: "21:00"},
      {index: 4, time: "22:00"},
      {index: 5, time: "23:00"}
    ],
    intermediary: [
      {index: 0, datetime: "4/1(三)"},
      {index: 1, datetime: "4/2(四)"},
      {index: 2, datetime: "4/7(二)"},
      {index: 3, datetime: "4/8(三)"},
      {index: 4, datetime: "4/9(四)"}
    ],
    intermediary_times: [
      {index: 0, time: "17:00"},
      {index: 1, time: "18:00"},
      {index: 2, time: "19:00"},
      {index: 3, time: "20:00"},
      {index: 4, time: "21:00"},
      {index: 5, time: "22:00"},
      {index: 6, time: "23:00"},
      {index: 7, time: "24:00"}
    ]
  });
});


router.post('/new', isLoggedIn, function(req, res) {
  // check if this user has joined req.body.gametype
  var gametypeToString = ['lol', 'hs', 'sc2', 'ava'];
  if (req.user.local.team[req.body.gametype] != undefined) {
    req.flash('newteamMessage', '你已經在此遊戲有加入隊伍了');
    res.redirect('/team/new?gametype='+gametypeToString[req.body.gametype]);
    return;
  } else if (req.body.gametype >= 0 && req.body.gametype <= 3) {
    Code.findById(req.body.regcode, function(err, code) {
      if (err || !code || code.used == true || !priceCheck(req.body.gametype, code.price)) {
        req.flash('newteamMessage', '啟動碼錯誤');
        res.redirect('/team/new?gametype='+gametypeToString[req.body.gametype]);
      } else {
        var newTeam = new Team();
        newTeam.name = sanitize(req.body.name);
        newTeam.game = Number(sanitize(req.body.gametype));
        newTeam.intro = sanitize(req.body.intro);
        newTeam.leader = req.user;
        newTeam.head = "";
        newTeam.tryout = Array.apply(null, Array(48)).map(function() {return true;});
        newTeam.intermediary = Array.apply(null, Array(40)).map(function() {return true;});
        newTeam.save(function(err, team) {

          if (err && err.code == 11000) {
            req.flash('newteamMessage', '隊伍名稱重複了');
            res.redirect('/team/new?gametype='+gametypeToString[req.body.gametype]);
            return;
          }

          code.used = true;
          code.updated = new Date();
          code.team = team.id;
          code.save();
          User.findById(req.user.id, function(err, doc) {
            doc.local.team[team.game] = team._id;
            doc.markModified('local.team');
            doc.save(function(err, user) {
              req.flash('editTeamMessage', '隊伍創建成功，請記得填寫相關資料');
              res.redirect('/team/'+team.id+'/edit');
            });
          });
        });
      }
    });
  }
});

router.post('/:id/addmember', isLoggedIn, isAdmin, function(req, res) {
  User.findOne({'local.email': req.body.email}, function(err, user) {
    if (err || !user) {
      res.json({ok:false, msg: '找不到該使用者'});
      return;
    }
    if (user.local.team[req.authTeam.game] != null) {
      res.json({ok:false, msg: '該玩家在同一個遊戲中已經有加入其他隊伍'});
      return;
    }
    var full = req.authTeam.isFull();
    if (full != false) {
      res.json({ok:false, msg: full});
      return;
    }
    user.local.team[req.authTeam.game] = req.authTeam.id;
    user.markModified('local.team');
    req.authTeam.member.push(user);
    user.save();
    req.authTeam.save();
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
      req.authTeam = team;
      return next();
    } else {
      res.redirect('/team/dashboard');
    }
  });
}

function priceCheck(gametype, price) {
  var priceTable = [250, 50, 50, 250];
  return priceTable[gametype] == price;
}

module.exports = router;
