var crypto = require('crypto');

var errors = require('../errors');
var util = require('../util');
var models = require('../models');
var users = require('./users');

var Token = models.Token,
    onError = util.onError;

// Functions
function findByToken(token, success, error) {
  Token.find({token: token}).success(success).error(error);
}
exports.findByToken = findByToken;


// Resources
exports.show = function show(req, res) {
  findByToken(req.cookies.token, function(token) {
     if(token) {
       token.getUser().success(function(user) {
         res.json(user);
       }).error(onError(res));
     } else {
       res.json(404, errors.notFound);
     }
   }, onError(res));
};

exports.create = function create(req, res, next) {
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
              res.cookie('token', token);
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
