var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('team', { user: req.user});
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
}

module.exports = router;
