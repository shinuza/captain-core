var crypto = require('crypto');

var _ = require('underscore');

var exceptions = require('../exceptions');
var util = require('../util');
var models = require('../db');


// Resources
function create(req, res, next) {
  var body = req.body;

  models.users.create(body, function(err, user) {
    if(err) {
      if(err.code == 23505) {
        err = new exceptions.AlreadyExists();
      }
      next(err);
    } else {
      res.json(201, user);
    }
  });
}
exports.create = util.loginRequired(create);

function update(req, res, next) {
  var body = req.body;

  models.users.update(req.params.user, body, function(err, user) {
    if(err) return next(err);
    if(!user) {
      next(new exceptions.NotFound());
    } else {
      res.json(201, user);
    }
  });
}
exports.update = util.loginRequired(update);

function index(req, res) {
  res.send(500);
}
exports.index = util.loginRequired(index);

function show(req, res, next) {
  models.users.find(req.params.user, function(err, user) {
    if(_.size(user) === 0) {
      next(new exceptions.NotFound);
    } else {
      res.json(user);
    }
  });
}
exports.show = util.loginRequired(show);

function destroy(req, res, next) {
  models.users.del(req.params.user, function(err, deleted) {
    if(err) return next(err);
    if(deleted === 0) {
      next(new exceptions.NotFound());
    } else {
      res.send(204);
    }
  });
}
exports.destroy = util.loginRequired(destroy);