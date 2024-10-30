const passport = require('passport')

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    else res.redirect('/login');
  }

function forwardAuthenticated(req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    else{
      res.redirect('/')
    }
}

function ensureAdmin(req, res, next) {
  if (req.user.admin) {
    return next()
  } else {
    res.redirect('/')
  }
}

module.exports = { ensureAuthenticated, forwardAuthenticated, ensureAdmin };