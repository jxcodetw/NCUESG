var express = require('express');
var router = express.Router();

router.get('/', isLoggedIn, function(req, res) {
  res.render('user', { user: req.user});
});
/* GET users listing. */
router.get('/:id', function(req, res) {
  res.send('respond with a resource' + req.params.id);
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
}

module.exports = router;
