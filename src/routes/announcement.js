var express = require('express');
var router = express.Router();
var Announcement = require('../models/announcement');
var sanitize = require('../lib/sanitize-announcement');


router.get('/', function(req, res) {
  Announcement.find({}).sort({level: 'desc', 'created': 'desc'}).exec(function(err, ann) {
    res.render('announcement', {
      user: req.user,
      announcements: ann
    });
  });
});

router.get('/new', isAdmin, function(req, res) {
  res.render('announcement_new', {
    user: req.user
  });
});

router.get('/:id', function(req, res) {
  Announcement.find({}).sort({level: 'desc', 'created': 'desc'}).exec(function(err, ann) {
    res.render('announcement', {
      user: req.user,
      announcements: ann,
      show: req.params.id
    });
  });
});

router.get('/:id/edit', isAdmin, function(req, res) {
  Announcement.findById(req.params.id).sort({level: 'desc', 'created': 'desc'}).exec(function(err, ann) {
    if (ann) {
      res.render('announcement_edit', {
        user: req.user,
        announcement: ann
      });
    }
  });
});

router.post('/new', isAdmin, function(req, res) {
  var ann = new Announcement();
  ann.title = sanitize(req.body.title);
  ann.level = sanitize(req.body.level);
  ann.content = sanitize(req.body.content);
  ann.created = new Date();
  ann.save();
  res.redirect('/announcement');
});

router.post('/:id/edit', isAdmin, function(req, res) {
  Announcement.findById(req.params.id, function(err, doc) {
    doc.title = sanitize(req.body.title);
    doc.level = sanitize(req.body.level);
    doc.content = sanitize(req.body.content);
    doc.updated = new Date();
    doc.save();
  });
  res.redirect('/announcement');
});

router.get('/:id/delete', isAdmin, function(req, res) {  
  Announcement.findById(req.params.id, function(err, doc) {
    doc.remove();
  });
  res.redirect('/announcement');
});

module.exports = router;

function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.local.level >= 10)
    return next();
  else
    res.redirect('/announcement');
}
