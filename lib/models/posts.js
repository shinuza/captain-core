var uuid = require('node-uuid'),
    schema = require('js-schema');

var exceptions = require('../exceptions'),
    conf = require('../conf'),
    util = require('../util'),
    QueryBuilder = require('./../query_builder'),
    query = require('../db').query;


var qb = new QueryBuilder('posts', ['id', 'uuid', 'title', 'slug', 'summary', 'body', 'published', 'created_at', 'updated_at', 'user_id']);

var SELECT_SLUG = qb.select() + ' WHERE slug = $1',
    SELECT_COUNT = 'SELECT count(id) FROM posts',
    SELECT_ID = qb.select() + ' WHERE id = $1',
    DELETE_ID = qb.del() + ' WHERE id = $1';

var Schema = schema({
  title: String,
  summary: String,
  body: String,
  published: Boolean,
  user_id: Number
});

/**
 * Smart find, uses findBySlug or findBy id depending on `param` type
 *
 * @param {String, Number} param
 */

function find(param) {
  var fn, asInt = parseInt(param, 10);
  fn = isNaN(asInt) ? findBySlug : findById;
  fn.apply(null, arguments);
}
exports.find = find;

/**
 * Finds a post by `slug`
 * `cb` is passed with the matching post, or exceptions.NotFound if the `slug` is not found in the database
 *
 * @param {String} slug
 * @param {Function} cb
 */

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

/**
 * Finds a post by `id`
 * `cb` is passed with the matching post, or exceptions.NotFound if the `id` is not found in the database
 *
 * @param id
 * @param cb
 */

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

/**
 * Creates a new post.
 * `cb` is passed with the newly created post, or:
 *   - exceptions.BadRequest: if `body` does not satisfy the schema
 *   - exceptions.AlreadyExists: if a post with the same slug already exists
 *
 * @param {Object} body
 * @param {Function} cb
 */

function create(body, cb) {
  var validates = Schema(body);

  if(!validates) {
    return cb(new exceptions.BadRequest());
  }

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

/**
 * Updates post with `id`
 * `cb` is passed with the updated post, or exceptions.NotFound if the `id` is not found in the database
 *
 * @param {Number} id
 * @param {Object} body
 * @param {Function} cb
 */

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

/**
 * Deletes post with `id`
 * `cb` is passed with the number of affected rows, or exceptions.NotFound if the `id` is not found in the database
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
      cb(null, r.rowCount);
    }
  });
}
exports.del = del;

/**
 * Finds published posts
 *
 * @param {Number} page
 * @param {Function} cb
 */

function allPublished(page, cb) {
  var q,
    limit = parseInt(conf.get('POSTS_BY_PAGE'), 10),
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

/**
 * Finds all posts, used for admin only
 *
 * @param {Number} page
 * @param {Function} cb
 */

function all(page, cb) {
  var q,
    limit = parseInt(conf.get('POSTS_BY_PAGE_ADMIN'), 10),
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

/**
 * Counts published posts
 *
 * @param {Function} cb
 */

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

/**
 * Counts all posts, used for admin only
 *
 * @param {Function} cb
 */

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

/**
 * Returns all posts without pagination support
 *
 * @param cb
 */

function archive(cb) {
  query(qb.select() + ' WHERE published = true', function(err, r) {
    if(err) return cb(err);
    cb(null, r.rows);
  });
}
exports.archive = archive;