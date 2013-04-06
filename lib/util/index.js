var exceptions = require('./../exceptions.js'),
    conf = require('../conf');

/**
 * Checkes if `req` as a session and a user
 *
 * @param req
 * @returns Boolean
 */

function isLoggedIn(req) {
  return !!(req.session && req.session.user);
}
exports.isLoggedIn = isLoggedIn;

/**
 * Middleware indicating that the view `fn` requires login
 * @param fn
 * @returns {Function}
 */

function loginRequired(fn) {
  return function(req, res, next) {
    if(isLoggedIn(req)) {
      fn(req, res, next);
    } else {
      next(new exceptions.PermissionRequired());
    }
  }
}
exports.loginRequired = loginRequired;

