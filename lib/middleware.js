var fs = require('fs'),
    resolve = require('path').resolve,
    _ = require('underscore'),

    db = require('./db.js'),
    conf = require('./conf');

const HARVESTING_INTERVAL = 60 * 1000;


/**
 * Checks if the request holds a `token` cookie, and if that
 * token exists in the database,
 *
 * Set `harvest` to true if you want to harvest expired sessions
 *
 * @param harvest
 * @returns {Function}
 */

function authenticate(harvest) {
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
        if(err && err.statusCode === 404) return next();
        if(err) return next(err);
        if(user) {
          req.session = {
            user: user
          };
          db.tokens.touch(token, function(err) {
            if(err) return next(err);
            next();
          });
        } else {
          next();
        }
      });
    }
  };
}
exports.authenticate = authenticate;

/**
 * Custom error handler that handles exceptions properly
 *
 * @returns {Function}
 */

function errorHandler() {
  return function(err, req, res, next) {
    var debug = conf.env !== 'production';

    if(!err.statusCode) {
      if(!debug) {
        err.message = 'Oups! An unexpected error occurred...';
      } else {
        console.error(new Date);
        console.error(err.stack);
      }
      err.statusCode = 500;
    }

    res.status(err.statusCode);
    res.format({
      'text/html': function() {
        res.render('error', {
          statusCode: err.statusCode,
          stack: err.stack || '',
          message: err.view && debug ?
            err.message + '\n' + JSON.stringify(err.view, null, 4) :
            err.message
        });
      },
      'application/json': function() {
        res.json({
          message: err.message,
          statusCode: err.status || err.statusCode
        });
      },
      'text/plain': function() {
        res.type('txt').send(err.message);
      }
    })
  };
}
exports.errorHandler = errorHandler;

/**
 * Sets charset to `code` on all requests
 * @param code
 * @returns {Function}
 */

function charset(code) {
  return function(req, res, next) {
    res.charset = code;
    next();
  }
}
exports.charset = charset;

function firstRun() {
  return function(req, res, next) {
    if(req.url == '/') {
      db.posts.count(function(err, nb) {
        if(err) { return next(err); }
        if(nb === 0) {
          var html = fs.readFileSync(resolve(__dirname, '..', 'first_run.html')).toString(),
            tmpl = _.template(html);

          res.send(tmpl(conf));
        } else {
          next();
        }
      });
    } else {
      next();
    }
  }
}
exports.firstRun = firstRun;