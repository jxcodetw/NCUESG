var mongoose = require('mongoose');

var teamSchema = mongoose.Schema({
  game: Number,
  name: String,
  intro: String,
  leader: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  member: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
});

teamSchema.methods.addMember = function(user, cb) {
  if (this.game == 'lol' || this.game == 'ava' && member.length >= 5) 
    return "Team full";
  if (this.game == 'hs' || this.game =='sc2')
    return "Only one player";
  this.member.push(user);
  this.save(function(err, doc) {
    cb();
  });
}

teamSchema.methods.removeMember = function(userId) {
  var index = this.member.indexOf(userId);
  if (index != -1) {
    this.member.splice(index, 1);
  }
}

module.exports = mongoose.model('Team', teamSchema);
