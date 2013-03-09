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

  db.connect(s.DB, function(err) {
    if(err) return next(err);
    res.json(200, {ok: true});
  });
}
exports.connectionTest = connectionTest;

function tableCreation(req, res, next) {
  res.set('Content-Type','text/event-stream');
  db.syncDB({
    oncomplete: function(err) {
      if(err) return next(err);
      res.end();
    },

    onprogress: function(script) {
      res.write('data: ' + JSON.stringify({script: script}) + '\n\n');
    },

    forceDrop: true
  });
}
exports.tableCreation = tableCreation;