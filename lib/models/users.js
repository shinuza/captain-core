var schema = require('js-schema');

var settings = require('../settings'),
    util = require('../util'),
    exceptions = require('../exceptions'),
    QueryBuilder = require('./../query_builder'),
    query = require('../db').query;


var qb = new QueryBuilder('users', ['id', 'username', 'first_name', 'last_name', 'email', 'image_url', 'created_at', 'updated_at']),
    SELECT_USERNAME = qb.select() + ' WHERE username = $1',
    SELECT_CREDENTIALS = qb.select() + ' WHERE username = $1 AND password = $2',
    SELECT_ID = qb.select() + ' WHERE id = $1',
    DELETE_ID = qb.del() + ' WHERE id = $1';

var Schema = schema({
  username: String,
  password: String
});

/**
 * Smart find, uses findByUsername or findBy id depending on `param` type
 *
 * @param {String, Number} param
 */

function find(param) {
  var fn, asInt = parseInt(param, 10);
  fn = isNaN(asInt) ? findByUsername : findById;
  fn.apply(null, arguments);
}
exports.find = find;

/**
 * Finds a user by `username` and `password`
 * `cb` is passed with the matching user, or exceptions.AuthenticationFailed if nothing matches the parameters
 *
 * @param {String} username
 * @param {String} password
 * @param {Function} cb
 */

function findByCredentials(username, password, cb) {
  util.encode(password, function(err, encoded) {
    if(err) return cb(err);
    query(SELECT_CREDENTIALS, [username, encoded], function(err, r) {
      var result = r.rows[0];
      if(!err && !result) err = new exceptions.AuthenticationFailed();
      if(err) {
        cb(err);
      } else {
        cb(null, result);
      }
    });
  });
}
exports.findByCredentials = findByCredentials;

/**
 * Finds a user  by `username`
 * `cb` is passed with the matching user, or exceptions.NotFound if that `username` is not found in the database
 *
 * @param {String} username
 * @param {Function} cb
 */

function findByUsername(username, cb) {
  query(SELECT_USERNAME, [username], function(err, r) {
    var result = r.rows[0];
    if(!err && !result) err = new exceptions.NotFound();
    if(err) {
      cb(err);
    } else {
      cb(null, result);
    }
  });
}
exports.findByUsername = findByUsername;

/**
 * Finds a user  by `id`
 * `cb` is passed with the matching user, or exceptions.NotFound if that `id` is not found in the database
 *
 * @param {Number} id
 * @param {Function} cb
 */

function findById(id, cb) {
  query(SELECT_ID, [id], function(err, r) {
    var result = r.rows[0];
    if(!err && !result) err = new exceptions.NotFound();
    if(err) {
      cb(err);
    } else {
      cb(null, result);
    }
  });
}
exports.findById = findById;

/**
 * Creates a new user.
 * `cb` is passed with the newly created user, or:
 *   - exceptions.BadRequest: if `body` does not satisfy the schema
 *   - exceptions.AlreadyExists: if a token with the same `username` already exists
 *
 * @param {Object} body
 * @param {Function} cb
 */

function create(body, cb) {
  var validates = Schema(body);

  if(!validates) {
    return cb(new exceptions.BadRequest());
  }

  util.encode(body.password, function(err, encoded) {
    if(err) return cb(err);

    body.password = encoded;
    body.created_at = new Date();

    var q = qb.insert(body);
    query(q[0], q[1], function(err, r) {
      if(err) {
        if(err.code == 23505) {
          err = new exceptions.AlreadyExists();
        }
        cb(err);
      } else {
        cb(null, r.rows[0]);
      }
    });
  });
}
exports.create = create;

/**
 * Updates user with `id`
 * `cb` is passed with the updated user, or:
 *   - exceptions.NotFound if the `id` is not found in the database
 *   - exceptions.AlreadyExists if the `username` conflicts with another user
 *
 * @param {Number} id
 * @param {Object} body
 * @param {Function} cb
 */

function update(id, body, cb) {
  if(body.password) {
    util.encode(body.password, function(err, encoded) {
      if(err) return cb(err);
      body.password = encoded;
      _update();
    });
  } else {
    _update();
  }

  function _update() {
    var q = qb.update(id, body);
    query(q[0], q[1], function(err, r) {
      var result = r.rows[0];
      if(err && err.code == 23505) err = new exceptions.AlreadyExists();
      if(!err && !result) err = new exceptions.NotFound();
      if(err) {
        cb(err);
      } else {
        cb(null, result);
      }
    });
  }

}
exports.update = update;

/**
 * Finds all users
 * @param {Function} cb
 */

function all(cb) {
  query(qb.select(), function(err, r) {
    if(err) {
      cb(err);
    } else {
      cb(null, r.rows);
    }
  });
}
exports.all = all;

/**
 *
 * Deletes user with `id`
 * `cb` is passed with the number of affected rows, or  exceptions.NotFound if the `id` is not found in the database
 *
 * @param {Number} id
 * @param {Function} cb
 */

function del(id, cb) {
  query(DELETE_ID, [id], function(err, r) {
    var result = r.rowCount;
    if(!err && !result) err = new exceptions.NotFound();
    if(err) {
      cb(err);
    } else {
      cb(null, result);
    }
  });
}
exports.del = del;

/**
 *
 * Counts user in the table
 * `cb` is passed with the number of users
 *
 * @param {Function} cb
 */

function count(cb) {
  query('SELECT count(id) FROM users', function(err, r) {
    var result = r.rows[0].count;
    if(err) {
      cb(err);
    } else {
      cb(null, result);
    }
  });
}
exports.count = count;