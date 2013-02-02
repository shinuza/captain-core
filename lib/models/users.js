var pg = require('pg');

var settings = require('../settings');
var util = require('../util');
var QueryBuilder = require('./query_builder');

var qb = new QueryBuilder('users', ['id', 'username', 'password', 'first_name', 'last_name', 'email', 'image_url', 'last_login', 'created_at', 'updated_at']);
var SELECT_USERNAME = qb.select() + ' WHERE username = $1';
var SELECT_ID = qb.select() + ' WHERE id = $1';
var DELETE_ID = qb.del() + ' WHERE id = $1';

/*
 CREATE TABLE users (
 id SERIAL,
 username VARCHAR(255) NOT NULL UNIQUE,
 password TEXT NOT NULL,
 first_name VARCHAR(255),
 last_name VARCHAR(255),
 email VARCHAR(255),
 image_url VARCHAR(255),
 last_login TIMESTAMP,
 created_at TIMESTAMP NOT NULL,
 updated_at TIMESTAMP NOT NULL,
 CONSTRAINT users_pkey PRIMARY KEY (id)
 );
 */

function find(param) {
  var fn, asInt = parseInt(param, 10);
  fn = isNaN(asInt) ? findByUsername : findById;
  fn.apply(null, arguments);
}
exports.find = find;

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
  pg.connect(settings.get('DB'), function(err, client) {
    if(err) return cb(err);
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