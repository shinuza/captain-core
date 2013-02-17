var db = require('./db'),
    settings = require('./settings');

const HARVESTING_TIMEOUT = 6 * 1000;

function authenticate() {
  var maxAge = settings.get('SESSION_MAXAGE');
  setInterval(db.tokens.harvest(maxAge), HARVESTING_TIMEOUT);

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