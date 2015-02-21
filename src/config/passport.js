var LocalStrategy = require('passport-local');
var User = require('../models/user');
var sanitize = require('../lib/sanitize');

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
          return done(null, false, req.flash('loginMessage', '帳號或密碼錯誤'));
        if (!user.validPassword(password))
          return done(null, false, req.flash('loginMessage', '帳號或密碼錯誤'));
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
          return done(null, false, req.flash('signupMessage', '已有相同帳號被註冊'));
        } else if (password == req.body.password2) {
          var newUser = new User();
          newUser.local.email = sanitize(email);
          newUser.local.password = newUser.generateHash(password);
          newUser.local.name = sanitize(req.body.name);
          newUser.local.studentid = sanitize(req.body.studentid);
          newUser.local.phone = sanitize(req.body.phone);
          newUser.local.department = sanitize(req.body.department);
          newUser.local.grade = sanitize(req.body.grade);
          newUser.local.level = 0;
          newUser.local.team = [null, null, null, null];
          newUser.local.created = new Date();

          newUser.save(function(err) {
            if (err) {
              console.log(err);
              return done(null, false, req.flash('signupMessage', '不知名錯誤'));
            } else {
              return done(null, newUser);
            }
          });
        } else {
          return done(null, false, req.flash('signupMessage', '兩次輸入的密碼不相符'));
        }
      });
    });
  }));
}
