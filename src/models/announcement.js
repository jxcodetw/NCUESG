var mongoose = require('mongoose');

var announcementSchema = mongoose.Schema({
  title: String,
  level: Number,
  content: String,
  created: Date,
  updated: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Announcement', announcementSchema);
