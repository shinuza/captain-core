"use strict";

var db = require('../db.js')
  , HARVESTING_INTERVAL = 60 * 1000;

/**
 * Checks if the request holds a `token` cookie, and if that
 * token exists in the database,
 *
 * Set `harvest` to true if you want to harvest expired sessions
 *
 * @param harvest
 * @returns {Function}
 */

module.exports = function authenticate(harvest) {
  if(harvest) {
    setInterval(db.tokens.harvest, HARVESTING_INTERVAL);
  }

  return function(req, res, next) {
    var token = req.cookies.token;
    req.session = null;
    if(!token) {
      next();
    } else {
      db.tokens.findUserFromToken(token, function(err, user) {
        if(err) {
          return next(err.statusCode === 404 ? null : err);
        }
        if(user) {
          req.session = {
            user: user
          };
          db.tokens.touch(token, function(err) {
            if(err) { return next(err); }
            next();
          });
        } else {
          next();
        }
      });
    }
  };
};
