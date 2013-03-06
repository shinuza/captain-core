var db = require('./db'),
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
    if(!err.statusCode) {
      err.message = 'Oups! An unexpected error occurred...';
      err.statusCode = 500;
      util.logger.error(err.message,  err);
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