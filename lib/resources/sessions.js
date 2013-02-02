var crypto = require('crypto');

var exceptions = require('../exceptions');
var util = require('../util');
var settings = require('../settings');

var models = require('../models');
var users = require('./users');


// Resources
exports.show = function show(req, res, next) {
  models.tokens.findUserFromToken(req.cookies.token, function(err, user) {
    if(err) {
      next(err);
    } else {
      res.json(user);
    }
  });
};

exports.create = exports.update = function createOrUpdate(req, res, next) {
  var token,
      body = req.body;

  models.users.findByCredentials(body.username, body.password, function(err, user) {
    if(!user) {
      return next(new exceptions.AuthenticationFailed);
    }

    crypto.randomBytes(32, function(err, buffer) {
      if (err) return next(err);
      token = buffer.toString('hex');

        models.tokens.create({token: token, user_id: user.id}, function(err) {
          if(err) return next(err);
          res.cookie('token', token,  { maxAge: settings.get('SESSION_MAXAGE') });
          res.send(201, user);
      });
    });
  });
};

exports.destroy = function destroy(req, res) {
  models.tokens.del(req.cookies.token, function(err) {
    if(err) {
      next(err)
    } else {
      res.send(204);
    }
  });
};
