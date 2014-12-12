var express = require('express');
var router = express.Router();

router.get('/', isLoggedIn, function(req, res) {
  res.render('user', { user: req.user});
});
/* GET users listing. */
router.get('/:id', function(req, res) {
  res.send('respond with a resource' + req.params.id);
});

router.get('/:id/edit', isEditable, function(req, res) {
  res.render('useredit', {user: req.user})
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
}

function isEditable(req, res, next) {
  if (req.isAuthenticated() && req.user.id == req.params.id || (req.user && req.user.level > 10))
    return next();
  res.redirect('/user/' + req.params.id);
}

module.exports = router;
