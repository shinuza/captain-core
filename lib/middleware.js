var users = require('./users');

function authenticate() {
  return function(req, res, next) {
    req.user = null;
    if(!req.cookies.token) {
      next();
    } else {
      users.findByToken(req.cookies.token, function(err, user) {
        req.user = user;
        next();
      });
    }
  };
}
exports.authenticate = authenticate;