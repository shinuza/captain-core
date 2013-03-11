var crypto = require('crypto'),
    path = require('path'),
    fs = require('fs');

var uuid = require('node-uuid');

var db = require('../db.js'),
    util = require('../util'),
    defaults = require('../defaults.js'),
    settings = require('../settings');


function connectionTest(req, res, next) {
  settings.set('DB', req.body.uri);

  db.query('SELECT NOW();', function(err) {
    if(err) {
      if(err.code == 'ENOTFOUND') {
        err.message = 'Failure: Address not found!';
      }
      next(err);
    } else {
      res.json(200, {ok: true});
    }
  });
}
exports.connectionTest = connectionTest;

function tableCreation(req, res, next) {
  res.set('Content-Type','text/event-stream');

  db.syncDB({
    oncomplete: function(err) {
      if(err) return next(err);
      res.end('data: ' + JSON.stringify({done: true}) + '\n\n');
    },

    onprogress: function(script) {
      res.write('data: ' + JSON.stringify({script: script}) + '\n\n');
    },

    forceDrop: false
  });
}
exports.tableCreation = tableCreation;

function commit(req, res, next) {
  var obj = {
      DB: settings.get('DB'),
      SITE_ID: uuid.v4(),
      SECRET_KEY: crypto.randomBytes(64).toString('base64')
    };

  var err = settings.save(obj, path.join(process.cwd(), settings.DEFAULT_FILENAME));
  if(err) {
    if(err.code == 'EACCES') {
      err.message = 'You don\'t have permission to write to `' + err.path + '`';
    }
    next(err);
  } else {
    res.json(201, {ok: true});
  }
}
exports.commit = commit;

function userCreation(req, res, next) {
  var body = req.body;

  db.users.create(body, function(err) {
    if(err) return next(err);
    res.json(201, {ok: true});
  });
}
exports.userCreation = userCreation;