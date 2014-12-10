var mongoose = require('mongoose');

var teamSchema = mongoose.Schema({
  game: String,
  name: String,
  member: [String]
});

teamSchema.methods.addMember = function(userId) {
  if (this.game == 'lol' || this.game == 'ava' && member.length >= 6) 
    return "Team full";
  if (this.game == 'hs' || this.game =='sc2' && member.length >= 1)
    return "Team full";
  member.push(userId);
  this.save();
}

module.exports = mongoose.model('Team', teamSchema);
