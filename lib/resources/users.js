var crypto = require('crypto');

var _ = require('underscore');

var exceptions = require('../exceptions');
var util = require('../util');
var db = require('../db');


// Resources
function create(req, res, next) {
  var body = req.body;

  db.users.create(body, function(err, user) {
    if(err) return next(err);
    res.json(201, user);
  });
}
exports.create = util.loginRequired(create);

function update(req, res, next) {
  var body = req.body;

  db.users.update(req.params.user, body, function(err, user) {
    if(err) return next(err);
    res.json(201, user);
  });
}
exports.update = util.loginRequired(update);

function index(req, res) {
  db.users.all(function(err, users) {
    if(err) return next(err);
    res.json(users);
  });
}
exports.index = util.loginRequired(index);

function show(req, res, next) {
  db.users.find(req.params.user, function(err, user) {
    if(err) return next(err);
    res.json(user);
  });
}
exports.show = util.loginRequired(show);

function destroy(req, res, next) {
  db.users.del(req.params.user, function(err) {
    if(err) return next(err);
    res.send(204);
  });
}
exports.destroy = util.loginRequired(destroy);