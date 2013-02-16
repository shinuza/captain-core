var uuid = require('node-uuid');

var exceptions = require('../exceptions');
var settings = require('../settings');
var util = require('../util');
var QueryBuilder = require('./../query_builder');
var query = require('../db').query;

var qb = new QueryBuilder('posts', ['id', 'uuid', 'title', 'slug', 'summary', 'body', 'published', 'created_at', 'updated_at', 'user_id']);
var SELECT_SLUG = qb.select() + ' WHERE slug = $1';
var SELECT_COUNT = 'SELECT count(id) FROM posts';
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
    if(!result) err = new exceptions.NotFound();
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
    var result = r.rows[0];
    if(!result) err = new exceptions.NotFound();
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

function update(id, body, cb) {
  body.updated_at = new Date();

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

function allPublished(page, cb) {
  var q,
    limit = parseInt(settings.get('POSTS_BY_PAGE'), 10),
    offset = (page - 1) * limit;

  countPublished(function(err, count) {
    if(err) return cb(err);

    q = qb.select();
    q += ' WHERE published = true';
    q += ' LIMIT ' + limit + ' OFFSET ' + offset;

    query(q, function(err, r) {
      if(err) {
        cb(err);
      } else {
        cb(null, {
          rows: r.rows,
          count: count,
          limit: limit,
          offset: offset
        })
      }
    });
  });

}
exports.allPublished  = allPublished;

function all(page, cb) {
  var q,
    limit = parseInt(settings.get('POSTS_BY_PAGE_ADMIN'), 10),
    offset = (page - 1) * limit;

  count(function(err, count) {
    if(err) return cb(err);

    q = qb.select();
    q += ' LIMIT ' + limit + ' OFFSET ' + offset;

    query(q, function(err, r) {
      if(err) {
        cb(err);
      } else {
        cb(null, {
          rows: r.rows,
          count: count,
          limit: limit,
          offset: offset
        })
      }
    });
  });
}
exports.all = all;

function countPublished(cb) {
  query(SELECT_COUNT + ' WHERE published = true', function(err, r) {
    if(err) {
      cb(err);
    } else {
      cb(null, r.rows[0].count);
    }
  });
}
exports.countPublished = countPublished;

function count(cb) {
  query(SELECT_COUNT, function(err, r) {
    if(err) {
      cb(err);
    } else {
      cb(null, r.rows[0].count);
    }
  });
}
exports.count = count;