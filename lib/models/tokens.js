var pg = require('pg');
var uuid = require('node-uuid');

var settings = require('../settings');
var util = require('../util');
var QueryBuilder = require('./query_builder');

var qb = new QueryBuilder('tokens', ['id', 'token', 'created_at', 'updated_at', 'user_id']);
var SELECT_ID = qb.select() + ' WHERE id = $1';
var DELETE_ID = qb.del() + ' WHERE id = $1';

/*
 CREATE TABLE tokens (
 id SERIAL,
 token VARCHAR(255) NOT NULL UNIQUE,
 created_at TIMESTAMP NOT NULL,
 updated_at TIMESTAMP NOT NULL,
 user_id INTEGER NOT NULL,
 CONSTRAINT tokens_pkey PRIMARY KEY (id)
 );
 */

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
    body.updated_at = new Date();

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