var express = require('express');
var router = express.Router();
var async = require('async');
var Competition = require('../models/competition');
var Team = require('../models/team');
var User = require('../models/user');
//var sanitize = require('../lib/sanitize');
var gameList = [
  "英雄聯盟",
  "爐石戰記：魔獸英雄傳",
  "星海爭霸II：蟲族之心",
  "AVA戰地之王"
];
var timeList = [
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
];

//done
router.get('/', function(req, res) {
  var finished = 0;
  var query = {'winner': -1};
  if (req.query.old && req.query.old == 1) {
      finished = 1;
      query = {$or: [{'winner':0}, {'winner':1}]};
  }
  // async wait for all task to be done.
  async.parallel(
    {
      lolcomps: function(cb) {
        var qlol = query;
        qlol.gametype=0;
        Competition.find(qlol).sort({'time': 1}).populate('team1').populate('team2').exec(function(err, com) {
          cb(null, com);
        });
      },
      hscomps: function(cb) {
        var qhs = query;
        qhs.gametype=1;
        Competition.find(qhs).sort({'time': 1}).populate('team1').populate('team2').exec(function(err, com) {
          cb(null, com);
        });
      },
      sc2comps: function(cb) {
        var qsc2 = query;
        qsc2.gametype=2;
        Competition.find(qsc2).sort({'time': 1}).populate('team1').populate('team2').exec(function(err, com) {
          cb(null, com);
        });
      },
      avacomps: function(cb) {
        var qava = query;
        qava.gametype=3;
        Competition.find(qava).sort({'time': 1}).populate('team1').populate('team2').exec(function(err, com) {
          cb(null, com);
        });
      },
    },
    function(err, result) {
      res.render('competitions', {
        user: req.user,
        lolcomps: result.lolcomps,
        hscomps: result.hscomps,
        sc2comps: result.sc2comps,
        avacomps: result.avacomps,
        finished: finished,
        times: timeList
      });
    }
  );
});

router.post('/team-type', function(req, res) {
  Team.find({'game': req.body.game}, function(err, tem) {
    var opt = '';
    for(var i in tem) {
      opt += '<div class="item" data-value="' + tem[i].id + '">' + tem[i].name + '</div>'   
    }
    var result = 
            '<div class="field"><label>Team A</label><div class="options ui selection dropdown"><input type="hidden" name="team1"><div class="default text">Team A</div><i class="dropdown icon"></i><div class="menu">'+opt+'</div></div></div>' + 
            '<div class="field"><label>Team B</label><div class="options ui selection dropdown"><input type="hidden" name="team2"><div class="default text">Team B</div><i class="dropdown icon"></i><div class="menu">'+opt+'</div></div></div>';
      res.json(result);
  });
});

//done
router.get('/new', isAdmin, function(req, res) {
  res.render('competition_new', {
    user: req.user,
    gametypes: gameList,
    times: timeList,
  });
});

router.get('/:id', function(req, res) {
  Competition.findById(req.params.id).populate('team1').populate('team2').exec(function(err, com) {
    if (err || !com) {
      res.redirect('/competition');
      return;
    }
    res.render('competition', {
      user: req.user,
      com: com,
      game: gameList[com.gametype],
      time: timeList[com.time]
    });
  });
});

router.get('/:id/edit', isAdmin, function(req, res) {
  Competition.findById(req.params.id).populate('team1').populate('team2').exec(function(err, com) {
    if (com) {
      Team.find({'game': com.gametype}).exec(function(err, tem) {
        res.render('competition_edit', {
          user: req.user,
          gametypes: gameList,
          competition: com,
          times: timeList,
          teams: tem,
          messages: req.flash('info')
        });
      });
    } else {
      res.redirect('/competition');
    }
  });
});

// todo: fix time, and team1 & team2 has bug?
router.post('/new', isAdmin, function(req, res) {
  var com = new Competition();
  com.gametype = req.body.gametype;
  com.comp_type = req.body.comp_type;
  Team.findById(req.body.team1, function(err, team1) {
    com.team1 = team1;
    Team.findById(req.body.team2, function(err, team2) {
      com.team2 = team2;
      com.finished = 0; // default: not finished
      com.time = req.body.time;
      com.winner = -1;
      com.replay_url = '無';
      com.save();
      team1.competitions.push(com);
      team2.competitions.push(com);
      team1.save();
      team2.save();
      res.redirect('/competition');
    })
  });
});

router.post('/:id/edit', isAdmin, function(req, res) {
  Competition.findById(req.params.id, function(err, com) {
    com.gametype = req.body.gametype;
    com.comp_type = req.body.comp_type;
    com.team1 = req.body.team1;
    com.team2 = req.body.team2;
    com.time = req.body.time;
    com.replay_url = req.body.replay_url;
    com.winner = req.body.winner;
    com.save();
    req.flash('info', '已修改賽事');
    res.redirect('/competition/'+req.params.id+'/edit');
  });
});

router.get('/:id/delete', isAdmin, function(req, res) {  
  Competition.findById(req.params.id, function(err, com) {
    var i, index;
    Team.findById(com.team1, function(err, team1) {
      index = -1;
      for(i=0;i<team1.competitions.length;++i) {
        if (team1.competitions[i].id == com.id) {
          index = i;
          break;
        }
      }
      if (index > -1) {
        team1.competitions.splice(index, 1);
        team1.markModified('competitions');
        team1.save();
      }
      Team.findById(com.team2, function(err, team2) {
        index = -1;
        for(i=0;i<team2.competitions.length;++i) {
          if (team2.competitions[i].id == com.id) {
            index = i;
            break;
          }
        }
        if (index > -1) {
          team2.competitions.splice(index, 1);
          team2.markModified('competitions');
          team2.save();
        }
        com.remove();
        res.redirect('/competition');
      })
    });
  });
});

module.exports = router;

function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.local.level > 0)
    return next();
  else
    res.redirect('/competition');
}
