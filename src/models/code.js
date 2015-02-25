var mongoose = require('mongoose');

var codeSchema = mongoose.Schema({
  price: Number,
  used: Boolean,
  created: Date,
  updated: Date,
  team: {type: mongoose.Schema.Types.ObjectId, ref: 'Team'},
});

module.exports = mongoose.model('Code', codeSchema);
