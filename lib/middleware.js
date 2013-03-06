var db = require('./db'),
    settings = require('./settings.js'),
    util = require('./util');

const HARVESTING_INTERVAL = 60 * 1000;

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
        }
        next();
      });
    }
  };
}
exports.authenticate = authenticate;

function errorHandler() {
  return function(err, req, res, next) {
    var debug = settings.get('DEBUG');

    if(!err.statusCode) {
      util.logger.error(err.message,  err);
      if(!debug) {
        err.message = 'Oups! An unexpected error occurred...';
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
        res.json(err);
      },
      'text/plain': function() {
        res.type('txt').send(err.message);
      }
    })
  };
}
exports.errorHandler = errorHandler;

function notFoundHandler() {
  return function(req, res, next) {
    // If we are here it's likely that the router didn't match any route
    if(res.statusCode == 200) {
      util.logger.info('Not found', {url: req.url});
      res.status(404).render('404');
    } else {
      next();
    }
  };
}
exports.notFoundHandler = notFoundHandler;

function charset(code) {
  return function(req, res, next) {
    res.charset = code;
    next();
  }
}
exports.charset = charset;

function congfigurationHandler() {
  const ROUTE = '/admin/setup';

  return function(req, res, next) {
    if(settings.length() === 0 && req.url != ROUTE) {
      res.redirect(ROUTE);
    } else {
      next();
    }
  }
}
exports.configurationHandler = congfigurationHandler;
