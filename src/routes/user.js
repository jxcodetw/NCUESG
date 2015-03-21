var express = require('express');
var router = express.Router();
var Team = require('../models/team');
var User = require('../models/user');
var sanitize = require('../lib/sanitize');

var departmentList = [
  "placeholder",
  "校外人士",
  "中國文學系",
  "英美語文學系",
  "法國語文學系",
  "理學院學士班",
  "物理學系",
  "數學系",
  "化學學系",
  "生命科學系",
  "光電科學與工程學系",
  "化學工程與材料工程學系",
  "土木工程學系",
  "機械工程學系",
  "企業管理學系",
  "資訊管理學系",
  "財務金融學系",
  "經濟學系",
  "電機工程學系",
  "資訊工程學系",
  "通訊工程學系",
  "地球科學學系",
  "大氣科學學系"
];

var gradeList = [
  "placeholder",
  "1年級",
  "2年級",
  "3年級",
  "4年級",
  "碩士",
  "博士"
];

router.get('/', function(req, res) {
  User.find().populate('team').exec(function(err, users) {
    res.render('users', {
      user: req.user,
      users: users,
      departmentToName: departmentList
    });
  });
});

router.get('/:id', function(req, res) {
  User.findById(req.params.id).populate('local.team').exec(function(err, user) {
    if (err || !user) {
      console.log(req.headers['x-forwarded-for'] || req.connection.remoteAddress);
      res.redirect('/user');
      return;
    }
    res.render('user', {
      user: req.user,
      toshow: user,
      departmentToName: departmentList,
      gradeToName: gradeList,
      gameToImg: [
        "lol.png",
        "hs.jpg",
        "sc2.png",
        "ava.jpg"
      ]
    });
  });
});

router.get('/:id/edit', isEditable, function(req, res) {
  User.findById(req.params.id).exec(function(err, user) {
    res.render('user_edit', {
      user: req.user,
      toedit: user,
      successMessage: req.flash('editSuccessMessage'),
      errorMessage: req.flash('editErrorMessage')
    });
  });
});

router.post('/:id/edit', isEditable, function(req, res) {
  User.findById(req.params.id).exec(function(err, user) {
    if (err || !user) {
      res.redirect('/user/'+req.params.id+'/edit');
      return;
    }
    user.local.name = sanitize(req.body.name);
    user.local.studentid = sanitize(req.body.studentid);
    user.local.phone= sanitize(req.body.phone);
    user.local.department= sanitize(req.body.department);
    user.local.grade= sanitize(req.body.grade);

    user.local.lolid = sanitize(req.body.lolid);
    user.local.lolgpid = sanitize(req.body.lolgpid);
    user.local.loluid = sanitize(req.body.loluid);

    user.local.hsid = sanitize(req.body.hsid);
    user.local.hsladder = sanitize(req.body.hsladder);

    user.local.sc2id = sanitize(req.body.sc2id);
    user.local.sc2ladder = sanitize(req.body.sc2ladder);

    user.local.avaid = sanitize(req.body.avaid);
    user.local.avagpid = sanitize(req.body.avagpid);
    user.local.avauid = sanitize(req.body.avauid);

    user.local.updated = new Date();

    if (req.body.newpassword.length > 0) { 
      if (req.body.newpassword.length < 6) {
        req.flash('editErrorMessage', '密碼須長度大於6');
        res.redirect('/user/'+req.params.id+'/edit');
        return;
      }
      if (req.body.newpassword == req.body.newpassword2) {
        user.local.password = user.generateHash(req.body.newpassword);
      } else {
        req.flash('editErrorMessage', '兩次密碼輸入不符');
        res.redirect('/user/'+req.params.id+'/edit');
        return;
      }
    }

    req.flash('editSuccessMessage', '資料修改成功');
    user.save();

    res.redirect('/user/'+req.params.id+'/edit');
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
}

function isEditable(req, res, next) {
  if (req.isAuthenticated() && req.user.id == req.params.id || (req.user && req.user.local.level > 10))
    return next();
  res.redirect('/user/' + req.params.id);
}

module.exports = router;
