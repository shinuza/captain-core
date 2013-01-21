var fs = require('fs');
var path = require('path');
var util = require('./util');
var format = require('util').format;

var errors = require('./errors');
var onError = require('./util').onError;
var sessions = require('./resources/sessions');
var settings = require('./settings');

const HARVESTING_TIMEOUT = 5 * 1000;

function authenticate() {
  var maxAge = settings.get('SESSION_MAXAGE');
  setInterval(function() {
    var d = new Date();
    sessions.all(function(sessions) {
      sessions.forEach(function(session) {
        if((d - session.createdAt) > maxAge) {
          session.destroy();
        }
      });
    }, function() {
      console.log(arguments)
    });

  }, HARVESTING_TIMEOUT);

  return function(req, res, next) {
    req.session = null;
    if(!req.cookies.token) {
      next();
    } else {
      sessions.findByToken(req.cookies.token, function(token) {
        if(token) {
          token.getUser().success(function(user) {
            req.session = {
              user: user
            };
            next();
          }).error(onError(res));
        } else {
          res.clearCookie('token');
          next();
        }
      }, onError(res));
    }
  };
}
exports.authenticate = authenticate;

function errorHandler() {
  var DEBUG = settings.get('DEBUG');
  return function(err, req, res, next) {
    if(DEBUG) {
      console.error(err);
    }
    if(!err.statusCode) {
      err.message = 'Oups! An unexpected error occurred...';
      err.statusCode = 500;
    }
    res.status(err.statusCode);

    if (req.accepts('html')) {
      res.render('error', err);
    } else if (req.accepts('json')) {
      res.json(err);
    } else {
      res.type('txt').send(err.message);
    }
  };
}
exports.errorHandler = errorHandler;