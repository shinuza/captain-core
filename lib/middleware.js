var fs = require('fs');
var path = require('path');
var util = require('./util');
var format = require('util').format;

var errors = require('./exceptions');
var models = require('./models');
var settings = require('./settings');

const HARVESTING_TIMEOUT = 5 * 1000;

function authenticate() {
  var maxAge = settings.get('SESSION_MAXAGE');
  setInterval(function() {
    var d = new Date();


  }, HARVESTING_TIMEOUT);

  return function(req, res, next) {
    var token = req.cookies.token;
    req.session = null;
    if(!token) {
      next();
    } else {
      models.tokens.findUserFromToken(token, function(err, user) {
        if(err) return next(err);
        if(!user) {
          res.clearCookie('token');
        } else {
          req.session = {
            user: user
          };
        }
        next();
      });
    }
  };
}
exports.authenticate = authenticate;

function errorHandler() {
  var DEBUG = settings.get('DEBUG');

  return function(err, req, res, next) {
    if(!err.statusCode) {
      if(DEBUG) {
        console.error('\x1b[31m' + err.stack + '\x1b[0m');
      }
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