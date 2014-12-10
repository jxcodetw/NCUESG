var express = require('express');
var router = express.Router();
var Announcement = require('../models/announcement');


router.get('/', function(req, res) {
  Announcement.find({}, function(err, ann) {
    res.send(JSON.stringify(ann), 200);
  });
});

router.get('/:id', function(req, res) {
  Announcement.findById(req.params.id, function(err, ann) {
    res.send(req.params.id + ':' + JSON.stringify(ann), 200);
  });
});

router.post('/new', function(req, res) {
  var ann = new Announcement();
  ann.title = req.body.title;
  ann.level = req.body.level;
  ann.content = req.body.content;
  ann.created = new Date();
  ann.save();
  res.json(req.body);
});

module.exports = router;
