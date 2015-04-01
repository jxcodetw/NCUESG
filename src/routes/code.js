var express = require('express');
var router = express.Router();
var Code = require('../models/code');

router.get('/', isAdmin, function(req, res) {
  Code.find({used: true}).sort({"updated": 1}).populate('team').exec(function(err, usedCode) {
    Code.find({used: false}).sort({price: 'asc'}).exec(function(err, newCode) {
      res.render('codes', {
        user: req.user,
        usedCodes: usedCode,
        newCodes: newCode
      });
    });
  });
});

router.get('/new/50', isAdmin, function(req, res) {
  var code = new Code();
  code.price = 50;
  code.created = new Date();
  code.used = false;
  code.save();
  res.redirect('/code');
});

router.get('/new/250', isAdmin, function(req, res) {
  var code = new Code();
  code.price = 250;
  code.created = new Date();
  code.used = false;
  code.save();
  res.redirect('/code');
});

router.get('/print', isAdmin, function(req, res) {
  Code.find({'used': false}).sort({price: 'asc'}).exec(function(err, codes) {
    res.render('printcode', {
      user: req.user,
      codes: codes
    });
  });
});

router.get('/:id/delete', isAdmin, function(req, res) {
  Code.findById(req.params.id).remove().exec();
  res.redirect('/code');
});


module.exports = router;

function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.local.level >= 10)
    return next();
  else
    res.redirect('/');
}
