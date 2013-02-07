var settings = require('../settings');
var util = require('../util');
var QueryBuilder = require('./../query_builder');
var query = require('../db').query;
var exceptions = require('../exceptions');

var qb = new QueryBuilder('tags', ['id', 'title', 'slug']);
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
    var result = r.rows[0];
    if(!err && !result) err = new exceptions.NotFound();
    if(err) {
      cb(err);
    } else {
      cb(null, result);
    }
  });
}
exports.findBySlug = findBySlug;

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

function create(body, cb) {
  body.slug = util.slugify(body.title);

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
  var q = qb.update(id, body);

  query(q[0], q[1], function(err, r) {
    var result = r.rows[0];
    if(!err && !result) err = new exceptions.NotFound();
    if(err) {
      cb(err);
    } else {
      cb(null, result);
    }
  });
}
exports.update = update;

function all(cb) {
  var q =
    'SELECT t.id, t.title, t.slug, count(pt.post_id) AS count FROM tags t ' +
    'JOIN "posts_tags" pt ON pt.tag_id = t.id ' +
    'GROUP BY t.id, t.title, t.slug';
  query(q, function(err, r) {
    cb(err, r.rows);
  });
}
exports.all = all;

function del(id, cb) {
  query(DELETE_ID, [id], function(err, r) {
    var result = r.rowCount;
    if(!err && !result) err = new exceptions.NotFound();
    if(err) {
      cb(err);
    } else {
      cb(null, r.rowCount);
    }
  });
}
exports.del = del;