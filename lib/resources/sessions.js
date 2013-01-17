var crypto = require('crypto');

var errors = require('../errors');
var util = require('../util');
var settings = require('../settings');

var models = require('../models');
var users = require('./users');

var Token = models.Token,
    onError = util.onError;

// Functions
function findByToken(token, success, error) {
  Token.find({where: {token: token}}).success(success).error(error);
}
exports.findByToken = findByToken;

function all(success, error) {
  Token.all().success(success).error(error);
}
exports.all = all;


// Resources
exports.show = function show(req, res) {
  findByToken(req.cookies.token, function(token) {
     if(token) {
       token.getUser().success(function(user) {
         if(user) {
           res.json(user);
         } else {
           res.json(404, errors.notFound);
         }
       }).error(onError(res));
     } else {
       res.json(404, errors.notFound);
     }
   }, onError(res));
};

exports.create = exports.update = function createOrUpdate(req, res, next) {
  var token,
      body = req.body;

  users.findByUsername(body.username, function(user) {
    if(user === null) return res.send(403, errors.authenticationFailed);

    util.compare(body.password, user.password, function(err, matches) {
      if(err) return next(err);

      if(matches === true) {
        crypto.randomBytes(32, function(err, buffer) {
          if (err) return next(err);
          token = buffer.toString('hex');

          Token.create({token: token}).success(function(t) {
            user.setToken(t).success(function() {
              res.cookie('token', token,  { maxAge: settings.get('SESSION_MAXAGE') });
              res.send(201, user);
              // Don't wait on this
              user.updateAttributes({lastLogin: new Date}).error(util.log);
            }).error(onError(res))
          }).error(onError(res));
        });
      } else {
        res.send(403, errors.authenticationFailed);
      }
    });
  }, onError(res));
};

exports.destroy = function destroy(req, res) {
  findByToken(req.cookies.token, function(token) {
    if(token) {
      token.destroy().success(function() {
        res.clearCookie('token');
        res.send(204);
      }).error(onError(res));
    } else {
      res.clearCookie('token');
      res.send(204);
    }
  }, onError(res));
};
