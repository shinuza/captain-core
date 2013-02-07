var settings = require('../settings');
var util = require('../util');
var QueryBuilder = require('./../query_builder');
var query = require('../db').query;
var exceptions = require('../exceptions');

var qb = new QueryBuilder('tokens', ['id', 'token', 'created_at', 'user_id']);
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

function harvest(maxAge) {
  return function() {
    var q = "DELETE FROM tokens WHERE created_at <  now() AT TIME ZONE 'UTC' - interval '" + maxAge + "'";
    query(q, function(err) {
      if(err) console.log(err);
    });
  }
}
exports.harvest = harvest;