var onError = require('./helpers').onError;
var users = require('./users');

function authenticate() {
  return function(req, res, next) {
    req.user = null;
    if(!req.cookies.token) {
      next();
    } else {
      users.getToken(req.cookies.token, function(token) {
        token.getUser().success(function(user) {
          req.user = user;
          next();
        }).error(onError(res));
      }, onError(res));
    }
  };
}
exports.authenticate = authenticate;