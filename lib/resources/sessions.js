var crypto = require('crypto');
var _ = require('underscore');

var exceptions = require('../exceptions');
var util = require('../util');
var settings = require('../settings');

var db = require('../db');
var users = require('./users');


// Resources
exports.show = function show(req, res, next) {
  db.tokens.findUserFromToken(req.cookies.token, function(err, user) {
    if(err) return next(err);
    res.json(user);
  });
};

exports.create = exports.update = function createOrUpdate(req, res, next) {
  var token,
      body = req.body;

  db.users.findByCredentials(body.username, body.password, function(err, user) {
    if(err) return next(err);

    crypto.randomBytes(32, function(err, buffer) {
      if (err) return next(err);
      token = buffer.toString('hex');

        db.tokens.create({token: token, user_id: user.id}, function(err) {
          if(err) return next(err);
          res.cookie('token', token,  { maxAge: settings.get('SESSION_MAXAGE') });
          res.send(201, user);
      });
    });
  });
};

exports.destroy = function destroy(req, res, next) {
  db.tokens.del(req.cookies.token, function(err) {
    if(err) return next(err);

    res.send(204);
  });
};
