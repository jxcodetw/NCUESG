var LocalStrategy = require('passport-local');
var User = require('../models/user');

module.exports = function(passport) {
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user){
      done(err, user);
    });
  });


  passport.use('local-login', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true 
  },
  function(req, email, password, done) {
    if (email)
      email = email.toLowerCase(); 

    process.nextTick(function() {
      User.findOne({ 'local.email' :  email }, function(err, user) {
        if (err)
          return done(err);
        if (!user)
          return done(null, false, req.flash('loginMessage', 'No user found.'));
        if (!user.validPassword(password))
          return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
        else
          return done(null, user);
      });
    });

  }));


  passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  }, function(req, email, password, done) {
    if (email)
      email = email.toLowerCase();
    process.nextTick(function() {
      User.findOne({'local.email': email}, function(err, user) {
        if (err) {
          return done(err);
        }
        
        if (user) {
          return done(null, false, req.flash('signupMessage', 'already taken'));
        } else {
          var newUser = new User();
          newUser.local.email = email;
          newUser.local.password = newUser.generateHash(password);
          newUser.local.name = req.body.name;
          newUser.local.studentid = req.body.studentid;
          newUser.local.phone = req.body.phone;
          newUser.local.department = req.body.department;
          newUser.local.grade = req.body.grade;
          newUser.local.level = 0;
          newUser.local.created = new Date();

          newUser.save(function(err) {
            if (err) {
              throw err;
            } else {
              return done(null, newUser);
            }
          });
        }
      });
    });
  }));
}
