var schema = require('js-schema');

var conf = require('../conf'),
    util = require('../util'),
    QueryBuilder = require('./../query_builder'),
    query = require('../db').query,
    exceptions = require('../exceptions');


var qb = new QueryBuilder('tokens', ['id', 'token', 'expires_at', 'user_id']),
    SELECT = 'SELECT id, token, user_id, expires_at AT TIME ZONE \'UTC\' as expires_at FROM tokens',
    SELECT_ID = SELECT + ' WHERE id = $1',
    SELECT_TOKEN = SELECT + ' WHERE token = $1',
    DELETE_TOKEN = qb.del() + ' WHERE token = $1';

/**
 * Schema for creating/updating Tokens
 *
 * @param {String} token
 * @param {Number} user_id
 */

var Schema = schema({
  token: String,
  user_id: Number
});

/**
 * Finds a token by `id`
 *
 * `cb` is passed with the matching id or exceptions.NotFound
 *
 * @param {Number} id
 * @param {Function} cb
 */

function findById(id, cb) {
  query(SELECT_ID, [id], function(err, r) {
    var result = r.rows[0];
    if(!result && !err) err = new exceptions.NotFound();
    if(err) {
      cb(err);
    } else {
      cb(null, result);
    }
  });
}
exports.findById = findById;


/**
 * Finds a token by `token`
 *
 * `cb` is passed with the matching token or exceptions.NotFound
 *
 * @param {String} token
 * @param {Function} cb
 */

function findByToken(token, cb) {
  query(SELECT_TOKEN, [token], function(err, r) {
    var result = r.rows[0];
    if(!result && !err) err = new exceptions.NotFound();
    if(err) {
      cb(err);
    } else {
      cb(null, result);
    }
  });
}
exports.findByToken = findByToken;


/**
 * Finds associated user with the token matching `token`
 *
 * `cb` is passed with the matching user or exceptions.NotFound
 *
 * @param {String} token
 * @param {Function} cb
 */

function findUserFromToken(token, cb) {
  var q = "SELECT * FROM users " +
    "JOIN tokens t ON t.token = $1 " +
    "JOIN users u ON u.id = t.user_id";

  query(q, [token], function(err, r) {
    var result = r.rows[0];
    if(!result && !err) err = new exceptions.NotFound();
    if(err) {
      cb(err);
    } else {
      cb(null, result);
    }
  });

}
exports.findUserFromToken = findUserFromToken;

/**
 * Creates a new token.
 *
 * `cb` is passed with the newly created token or:
 *
 *   * exceptions.BadRequest: if `body` does not satisfy the schema
 *   * exceptions.AlreadyExists: if a token with the same `token` already exists
 *
 * @param {Object} body
 * @param {Function} cb
 */

function create(body, cb) {
  var validates = Schema(body);

  if(!validates) {
    return cb(new exceptions.BadRequest());
  }

  body.expires_at = util.stampify(conf.session_maxage);

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
}
exports.create = create;

/**
 *
 * Deletes token with `token`
 *
 * `cb` is passed with the number of affected rows or exceptions.NotFound
 *
 * @param {String} token
 * @param {Function} cb
 */

function del(token, cb) {
  query(DELETE_TOKEN, [token], function(err, r) {
    var result = r.rowCount;
    if(!result && !err) err = new exceptions.NotFound();
    if(err) {
      cb(err);
    } else {
      cb(null, result);
    }
  });
}
exports.del = del;

/**
 * Deletes expired tokens
 */

function harvest() {
  var q = "DELETE FROM tokens WHERE expires_at < now() AT TIME ZONE 'UTC'";
  query(q, function(err) {
    if(err) {
      console.error(new Date);
      console.error(err.stack);
    }
  });
}
exports.harvest = harvest;

/**
 * Touch token, set its `token.expires_at` to Date.now() + conf.session_maxage
 */

function touch(token, cb) {
  var date = util.stampify(conf.session_maxage);
  query("UPDATE tokens SET expires_at = $1 WHERE token = $2", [date, token], cb);
}
exports.touch = touch;