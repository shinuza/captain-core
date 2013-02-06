var uuid = require('node-uuid');

var settings = require('../settings');
var util = require('../util');
var QueryBuilder = require('./../query_builder');
var query = require('../db').query;

var qb = new QueryBuilder('posts', ['id', 'uuid', 'title', 'slug', 'summary', 'body', 'published', 'created_at', 'updated_at', 'user_id']);
var SELECT_SLUG = qb.select() + ' WHERE slug = $1';
var SELECT_ID = qb.select() + ' WHERE id = $1';
var DELETE_ID = qb.del() + ' WHERE id = $1';


function find(param) {
  var fn, asInt = parseInt(param, 10);
  fn = isNaN(asInt) ? findBySlug : findById;
  fn.apply(null, arguments);
}
exports.find = find;

function findBySlug(slug, cb) {
  query(SELECT_SLUG, [slug], function(err, r) {
    if(err) {
      cb(err);
    } else {
      cb(null, r.rows[0]);
    }
  });
}
exports.findBySlug = findBySlug;

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
  body.slug = util.slugify(body.title);
  body.uuid = uuid.v4();
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

function countPublished(cb) {
  query('SELECT count(id) FROM posts WHERE published = true', function(err, r) {
    if(err) {
      cb(err);
    } else {
      cb(null, r.rows[0].count);
    }
  });
}
exports.countPublished = countPublished;

function count(cb) {
  query('SELECT count(id) FROM posts', function(err, r) {
    if(err) {
      cb(err);
    } else {
      cb(null, r.rows[0].count);
    }
  });
}
exports.count = count;