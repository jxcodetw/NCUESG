var mongoose = require('mongoose');
var shortId = require('shortid');

var codeSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    'default': shortId.generate
  },
  price: Number,
  used: Boolean,
  created: Date,
  updated: Date,
  team: {type: mongoose.Schema.Types.ObjectId, ref: 'Team'},
});

module.exports = mongoose.model('Code', codeSchema);
