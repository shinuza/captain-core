var path = require('path'),
    fs = require('fs');

var db = require('../db.js'),
    util = require('../util'),
    defaults = require('../defaults.js'),
    settings = require('../settings');

function create_update(req, res, next) {
  var body = req.body;
  settings.set(body);
  settings.save(function(err) {
    if(err) return next(err);
    res.json(201, settings);
  });
}
exports.create = exports.update = util.loginRequired(create_update);

function show(req, res) {
  res.json(settings.toJSON());
}
exports.show = util.loginRequired(show);

function database(req, res, next) {
  var body = req.body,
      str = "exports.DB = '" + body.uri + "';";

  fs.writeFile(settings.getFile(), str,  function(err) {
    if(err) return next(err);
    res.json(201, {ok: true});
  });
}
exports.database = database;

function connectionTest(req, res, next) {
  var s = require(settings.getFile());
  db.connect(s.DB, function(err, client) {

  });
}
exports.connectionTest = connectionTest;