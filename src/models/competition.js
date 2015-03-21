var mongoose = require('mongoose');

var competitionSchema = mongoose.Schema({
  gametype: Number, // gametype 0 ~ 3
  comp_type: Number, // competition type: 0 ~ 2
  team1: {type: mongoose.Schema.Types.ObjectId, ref: 'Team'},
  team2: {type: mongoose.Schema.Types.ObjectId, ref: 'Team'},
  finished: Number, // finished: 1, not finished: 0
  time: Number,
  winner: Number, // no: -1, team1: 0, team2: 1
  replay_url: String,
});

/*
teamSchema.methods.isFull = function() {
  // lol, hs, sc, ava
  // 0  , 1 , 2 , 3
  if ((this.game == 0 || this.game == 3) && this.member.length >= 5) 
    return "隊伍已經滿了";
  if (this.game == 1 || this.game == 2)
    return "only one player allowed";
  return false;
}

teamSchema.methods.removeMember = function(userId) {
  var index = this.member.indexOf(userId);
  if (index != -1) {
    this.member.splice(index, 1);
  }
}
*/

module.exports = mongoose.model('Competition', competitionSchema);
