var crypto = require('crypto'),
    path = require('path'),
    fs = require('fs');

var uuid = require('node-uuid');

var db = require('../db.js'),
    util = require('../util'),
    defaults = require('../defaults.js'),
    settings = require('../settings');

function create_update(req, res, next) {
  settings.set(req.body);
  var error = settings.save();

  if(error) next(error);
  else res.json(201, settings.toJSON());
}
exports.create = exports.update = util.loginRequired(create_update);

function show(req, res) {
  res.json(settings.toJSON());
}
exports.show = util.loginRequired(show);

function connectionTest(req, res, next) {
  setTimeout(function() {
    res.json(500, {ok: false});
  }, 1000);

  db.connect(req.body.uri, function(err) {
    if(err) return next(err);
    res.json(200, {ok: true});
  });
}
exports.connectionTest = connectionTest;

function tableCreation(req, res, next) {
  var body = req.body;
  res.set('Content-Type','text/event-stream');

  db.syncDB({
    uri: body.uri,

    oncomplete: function(err) {
      if(err) return next(err);
      res.end();
    },

    onprogress: function(script) {
      res.write('data: ' + JSON.stringify({script: script}) + '\n\n');
    },

    forceDrop: false
  });
}
exports.tableCreation = tableCreation;

function commit(req, res, next) {
  var body = req. body,
      obj = {
        DB: body.uri,
        SITE_ID: uuid.v4(),
        SECRET_KEY: crypto.randomBytes(64).toString('base64')
      };

  var error = settings.save(obj, settings.DEFAULT_FILENAME);
  if(error) next(error);
  else res.json(201, {ok: true});
}
exports.commit = commit;

function createUser(req, res, next) {
  var body = req.body;

  db.users.create(body, function(err, user) {
    if(err) return next(err);
    res.json(201, user);
  });
}
exports.createUser = createUser;