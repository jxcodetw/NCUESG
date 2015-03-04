var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
  local : {
    email: String,
    password: String,
    name: String,
    studentid: Number,
    phone: String,
    department: Number,
    grade: Number,
    level: Number,
    team: [{type: mongoose.Schema.Types.ObjectId, ref: 'Team'}],
    lolid: String,
    lolgpid: String,
    loluid: String,
    hsid: String,
    hsladder: String,
    sc2id: String,
    sc2ladder: String,
    avaid: String,
    avagpid: String,
    avauid: String,
    created: Date,
    updated: {type: Date, default: Date.now}
  },
});

userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
}

module.exports = mongoose.model('User', userSchema);
