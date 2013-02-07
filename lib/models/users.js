var settings = require('../settings');
var util = require('../util');
var exceptions = require('../exceptions');
var QueryBuilder = require('./../query_builder');
var query = require('../db').query;

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

function findByUsername(username, cb) {
  query(SELECT_USERNAME, [username], function(err, r) {
    if(err) {
      cb(err);
    } else {
      cb(null, r.rows[0]);
    }
  });
}
exports.findByUsername = findByUsername;

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

function create(body, cb) {
  util.encode(body.password, function(err, encoded) {
    if(err) return cb(err);

    body.password = encoded;
    body.created_at = new Date();

    var q = qb.insert(body);
    query(q[0], q[1], function(err, r) {
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
      if(err) {
        cb(err);
      } else {
        cb(null, r.rows[0]);
      }
    });
  }

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

function del(id, cb) {
  query(DELETE_ID, [id], function(err, r) {
    if(err) {
      cb(err);
    } else {
      cb(null, r.rowCount);
    }
  });
}
exports.del = del;