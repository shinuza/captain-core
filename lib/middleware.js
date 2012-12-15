var restify = require('restify');

module.exports = {
  authorizationHandler: function(server) {
    return function authorizationHandler(req, res, next) {
        for(var i = 0, l = server.routes.length; i < l; i++) {
          var route = server.routes[i];
          if(new RegExp(route.pattern).test(req.url) && route.method === req.method)  {
            route.chain.forEach(function(fn) {
              if(fn.loginRequired === true && !server.username) {
                var error = new restify.NotAuthorizedError('You do not have permission to view this resource');
                return res.send(401, error);
              } else {
                next();
              }
            });
            break;
          }
        }
      next();
    }
  }
};