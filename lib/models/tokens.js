var settings = require('../settings');
var util = require('../util');
var QueryBuilder = require('./../query_builder');
var query = require('../db').query;

var qb = new QueryBuilder('tokens', ['id', 'token', 'created_at', 'updated_at', 'user_id']);
var SELECT_ID = qb.select() + ' WHERE id = $1';
var DELETE_TOKEN = qb.del() + ' WHERE token = $1';


function findById(id, cb) {
  query(SELECT_ID, [id], function(err, r) {
    if(err) {
      cb(err);
    } else {
      cb(null, r.rows[0]);
    }
  });
}
exports.findById = findById;

function findUserFromToken(token, cb) {
  var q = "SELECT * FROM users " +
    "JOIN tokens t ON t.token = $1 " +
    "JOIN users u ON u.id = t.user_id";

  query(q, [token], function(err, r) {
    if(err) {
      cb(err);
    } else {
      cb(null, r.rows[0]);
    }
  });

}
exports.findUserFromToken = findUserFromToken;

function create(body, cb) {

  body.created_at = new Date();

  var q = qb.insert(body);
  query(q[0], q[1], function(err, r) {
    if(err) {
      cb(err);
    } else {
      cb(null, r.rows[0]);
    }
  });
}
exports.create = create;

function update(id, body, cb) {
    body.updated_at = new Date();

    var q = qb.update(id, body);
    query(q[0], q[1], function(err, r) {
      if(err) {
        cb(err);
      } else {
        cb(null, r.rows[0]);
      }
    });
}
exports.update = update;

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

function del(token, cb) {
  query(DELETE_TOKEN, [token], function(err, r) {
    if(err) {
      cb(err);
    } else {
      cb(null, r.rowCount);
    }
  });
}
exports.del = del;