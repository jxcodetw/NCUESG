var mongoose = require('mongoose');

var announcementSchema = mongoose.Schema({
  title: String,
  level: Number,
  content: String,
  created: Date,
  updated: {type: Date, default: Date.now}
});

announcementSchema.methods.getImportant = function(max) {

}

announcementSchema.methods.getNormal = function(max) {

}

module.exports = mongoose.model('Announcement', announcementSchema);
