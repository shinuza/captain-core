"use strict";

var schema = require('js-schema')
  , conf = require('../conf')
  , crypto = require('../util/crypto.js')
  , exceptions = require('../exceptions.js')
  , builder = require('./../query_builder.js')
  , db = require('../db.js');


var qb = new builder('users',
  [ 'id'
  , 'username'
  , 'first_name'
  , 'last_name'
  , 'email'
  , 'image_url'
  , 'created_at'
  , 'updated_at']);

var SELECT_USERNAME = qb.select() + ' WHERE username = $1'
  , SELECT_CREDENTIALS = qb.select() + ' WHERE username = $1 AND password = $2'
  , SELECT_ID = qb.select() + ' WHERE id = $1'
  , DELETE_ID = qb.del() + ' WHERE id = $1';

/**
 * Schema for creating/updating Users
 *
 * @param {String} username
 * @param {String} password
 */

var Schema = schema({
  username: String,
  password: String
});

/**
 * Smart find, uses findByUsername or findBy
 *
 * @param {*} param
 */

function find(param) {
  var fn, asInt = parseInt(param, 10);
  fn = isNaN(asInt) ? findByUsername : findById;
  fn.apply(null, arguments);
}
exports.find = find;

/**
 * Finds a user by `username` and `password`
 *
 * `cb` is passed with the matching user or exceptions.AuthenticationFailed
 *
 * @param {String} username
 * @param {String} password
 * @param {Function} cb
 */

function findByCredentials(username, password, cb) {
  crypto.encode(password, function(err, encoded) {
    if(err) { return cb(err); }

    db.getClient(function(err, client, done) {
      client.query(SELECT_CREDENTIALS, [username, encoded], function(err, r) {
        var result = r && r.rows[0];
        if(!err && !result) { err = new exceptions.AuthenticationFailed(); }
        if(err) {
          cb(err);
          done(err);
        } else {
          cb(null, result);
          done();
        }
      });
    });
  });
}
exports.findByCredentials = findByCredentials;

/**
 * Finds a user  by `username`
 *
 * `cb` is passed with the matching user or exceptions.NotFound
 *
 * @param {String} username
 * @param {Function} cb
 */

function findByUsername(username, cb) {
  db.getClient(function(err, client, done) {
    client.query(SELECT_USERNAME, [username], function(err, r) {
      var result = r && r.rows[0];
      if(!err && !result) { err = new exceptions.NotFound(); }
      if(err) {
        cb(err);
        done(err);
      } else {
        cb(null, result);
        done();
      }
    });
  });
}
exports.findByUsername = findByUsername;

/**
 * Finds a user  by `id`
 * 
 * `cb` is passed with the matching user or exceptions.NotFound
 *
 * @param {Number} id
 * @param {Function} cb
 */

function findById(id, cb) {
  db.getClient(function(err, client, done) {
    client.query(SELECT_ID, [id], function(err, r) {
      var result = r && r.rows[0];
      if(!err && !result) { err = new exceptions.NotFound(); }
      if(err) {
        cb(err);
        done(err);
      } else {
        cb(null, result);
        done();
      }
    });
  });
}
exports.findById = findById;

/**
 * Creates a new user.
 *
 * `cb` is passed with the newly created user or:
 *
 *   * exceptions.BadRequest: if `body` does not satisfy the schema
 *   * exceptions.AlreadyExists: if a token with the same `username` already exists
 *
 * @param {Object} body
 * @param {Function} cb
 */

function create(body, cb) {
  var validates = Schema(body);

  if(!validates) {
    return cb(new exceptions.BadRequest());
  }

  crypto.encode(body.password, function(err, encoded) {
    if(err) { return cb(err); }

    body.password = encoded;
    body.created_at = new Date();

    var q = qb.insert(body);
    db.getClient(function(err, client, done) {
      client.query(q[0], q[1], function(err, r) {
        if(err) {
          if(err.code == 23505) {
            err = new exceptions.AlreadyExists();
          }
          cb(err);
          done(err);
        } else {
          cb(null, r.rows[0]);
          done();
        }
      });
    });
  });
}
exports.create = create;

/**
 * Updates user with `id`
 *
 * `cb` is passed with the updated user or:
 *   * exceptions.NotFound if the `id` is not found in the database
 *   * exceptions.AlreadyExists if the `username` conflicts with another user
 *
 * @param {Number} id
 * @param {Object} body
 * @param {Function} cb
 */

function update(id, body, cb) {
  if(body.password) {
    crypto.encode(body.password, function(err, encoded) {
      if(err) { return cb(err); }
      body.password = encoded;
      _update(id, body, cb);
    });
  } else {
    _update(id, body, cb);
  }
}
exports.update = update;

function _update(id, body, cb) {
  var q = qb.update(id, body);

  db.getClient(function(err, client, done) {
    client.query(q[0], q[1], function(err, r) {
      var result = r && r.rows[0];
      if(!err && !result) { err = new exceptions.NotFound(); }
      if(err) {
        if(err.code == 23505) {
          err = new exceptions.AlreadyExists();
        }
        cb(err);
        done(err);
      } else {
        cb(null, result);
        done();
      }
    });
  });
}

/**
 * Finds all users
 *
 * @param {Object} options
 * @param {Function} cb
 */

function all(options, cb) {
  var q
    , page = Number(options.page) || 1
    , limit = Number(options.limit) || conf.objects_by_page
    , offset = (page - 1) * limit;

  count(function(err, count) {
    if(err) { return cb(err); }

    q = qb.select();
    q += ' LIMIT ' + limit + ' OFFSET ' + offset;

    db.getClient(function(err, client, done) {
      client.query(q, function(err, r) {
        if(err) {
          cb(err);
          done(err);
        } else {
          cb(null, {
            rows: r.rows,
            count: count,
            limit: limit,
            offset: offset,
            page: page
          });
          done();
        }
      });
    });
  });
}
exports.all = all;

/**
 *
 * Deletes user with `id`
 *
 * `cb` is passed with the number of affected rows or exceptions.NotFound
 *
 * @param {Number} id
 * @param {Function} cb
 */

function del(id, cb) {
  db.getClient(function(err, client, done) {
    client.query(DELETE_ID, [id], function(err, r) {
      var result = r && r.rowCount;
      if(!err && !result) { err = new exceptions.NotFound(); }
      if(err) {
        cb(err);
        done(err);
      } else {
        cb(null, result);
        done();
      }
    });
  });
}
exports.del = del;

/**
 *
 * Counts user in the table
 *
 * `cb` is passed with the number of users
 *
 * @param {Function} cb
 */

function count(cb) {
  db.getClient(function(err, client, done) {
    client.query('SELECT count(id) FROM users', function(err, r) {
      var result = r && r.rows[0].count;
      if(err) {
        cb(err);
        done(err);
      } else {
        cb(null, result);
        done();
      }
    });
  });
}
exports.count = count;