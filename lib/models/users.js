var pg = require('pg');

var settings = require('../settings');
var util = require('../util');
var QueryBuilder = require('./query_builder');

var qb = new QueryBuilder('users', ['id', 'username', 'first_name', 'last_name', 'email', 'image_url', 'created_at', 'updated_at']);
var SELECT_USERNAME = qb.select() + ' WHERE username = $1';
var SELECT_CREDENTIALS = qb.select() + ' WHERE username = $1 AND password = $2';
var SELECT_ID = qb.select() + ' WHERE id = $1';
var DELETE_ID = qb.del() + ' WHERE id = $1';


function find(param) {
  var fn, asInt = parseInt(param, 10);
  fn = isNaN(asInt) ? findByUsername : findById;
  fn.apply(null, arguments);
}
exports.find = find;

function findByCredentials(username, password, cb) {
  util.encode(password, function(err, encoded) {
    if(err) return cb(err);
    pg.connect(settings.get('DB'), function(err, client) {
      if(err) return cb(err);
      client.query(SELECT_CREDENTIALS, [username, encoded], function(err, r) {
        if(err) {
          cb(err);
        } else {
          cb(null, r.rows[0]);
        }
      });
    });
  });
}
exports.findByCredentials = findByCredentials;

function findByUsername(slug, cb) {
  pg.connect(settings.get('DB'), function(err, client) {
    if(err) return cb(err);
    client.query(SELECT_USERNAME, [slug], function(err, r) {
      if(err) {
        cb(err);
      } else {
        cb(null, r.rows[0]);
      }
    });
  });
}
exports.findByUsername = findByUsername;

function findById(id, cb) {
  pg.connect(settings.get('DB'), function(err, client) {
    if(err) return cb(err);
    client.query(SELECT_ID, [id], function(err, r) {
      if(err) {
        cb(err);
      } else {
        cb(null, r.rows[0]);
      }
    });
  });
}
exports.findById = findById;

function create(body, cb) {
  util.encode(body.password, function(err, encoded) {
    if(err) return cb(err);

    pg.connect(settings.get('DB'), function(err, client) {
      if(err) return cb(err);
      body.password = encoded;
      body.created_at = new Date();

      var query = qb.insert(body);
      client.query(query[0], query[1], function(err, r) {
        if(err) {
          cb(err);
        } else {
          cb(null, r.rows[0]);
        }
      });
    });
  });
}
exports.create = create;

function update(id, body, cb) {
  pg.connect(settings.get('DB'), function(err, client) {
    if(err) return cb(err);

    var query = qb.update(id, body);
    client.query(query[0], query[1], function(err, r) {
      if(err) {
        cb(err);
      } else {
        cb(null, r.rows[0]);
      }
    });
  });
}
exports.update = update;

function all(cb) {
  pg.connect(settings.get('DB'), function(err, client) {
    if(err) return cb(err);
    client.query(qb.select(), function(err, r) {
      if(err) {
        cb(err);
      } else {
        cb(null, r.rows);
      }
    });
  });
}
exports.all = all;

function del(id, cb) {
  pg.connect(settings.get('DB'), function(err, client) {
    if(err) return cb(err);
    client.query(DELETE_ID, [id], function(err, r) {
      if(err) {
        cb(err);
      } else {
        cb(null, r.rowCount);
      }
    });
  });
}
exports.del = del;

function query(query, cb) {
  pg.connect(settings.get('DB'), function(err, client) {
    if(err) return cb(err);
    client.query(query, cb);
  });
}
exports.query = query;