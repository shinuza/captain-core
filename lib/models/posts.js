var schema = require('js-schema');

var exceptions = require('../exceptions'),
    conf = require('../conf'),
    string = require('../util/string'),
    crypto = require('../util/crypto'),
    QueryBuilder = require('./../query_builder'),
    db = require('../db.js');

var qb = new QueryBuilder('posts', ['id', 'uuid', 'title', 'slug', 'summary', 'body', 'published', 'created_at', 'updated_at', 'user_id']),
    SELECT_SLUG = qb.select() + ' WHERE slug = $1',
    SELECT_COUNT = 'SELECT count(id) FROM posts',
    SELECT_ID = qb.select() + ' WHERE id = $1',
    DELETE_ID = qb.del() + ' WHERE id = $1';

/**
 * Schema for creating/updating Posts
 *
 * @param {String} title
 * @param {String} summary
 * @param {String} body
 * @param {Boolean} published
 * @param {Number} user_id
 */

var Schema = schema({
  title: String,
  summary: String,
  body: String,
  published: Boolean,
  user_id: Number
});

/**
 * Smart find, uses findBySlug or findById
 *
 * @param {*} param
 */

function find(param) {
  var fn, asInt = Number(param);
  fn = isNaN(asInt) ? findBySlug : findById;
  fn.apply(null, arguments);
}
exports.find = find;

/**
 * Finds a post by `slug`
 *
 * `cb` is passed the matching post or exceptions.NotFound
 *
 * @param {String} slug
 * @param {Function} cb
 */

function findBySlug(slug, cb) {
  db.getClient(function(err, client, done) {
    client.query(SELECT_SLUG, [slug], function(err, r) {
      var result = r && r.rows[0];
      if(!result) err = new exceptions.NotFound();
      if(err) {
        cb(err);
      } else {
        cb(null, r.rows[0]);
      }
      done();
    });
  });
}
exports.findBySlug = findBySlug;

/**
 * Finds a post by `id`
 *
 * `cb` is passed the matching post or [exceptions.NotFound](/docs/exceptions#NotFound)
 *
 * @param {Number} id
 * @param {Function} cb
 */

function findById(id, cb) {
  db.getClient(function(err, client, done) {
    client.query(SELECT_ID, [id], function(err, r) {
      var result = r && r.rows[0];
      if(!result) err = new exceptions.NotFound();
      if(err) {
        cb(err);
      } else {
        cb(null, r.rows[0]);
      }
      done();
    });
  });
}
exports.findById = findById;

/**
 * Creates a new post.
 *
 * `cb` is passed the newly created post or:
 *
 *   * exceptions.BadRequest: if `body` does not satisfy the schema
 *   * exceptions.AlreadyExists: if a post with the same slug already exists
 *
 * @param {Object} body
 * @param {Function} cb
 */

function create(body, cb) {
  var validates = Schema(body);

  if(!validates) {
    return cb(new exceptions.BadRequest());
  }

  body.slug = string.slugify(body.title);
  body.uuid = crypto.uuid();
  body.created_at = new Date();

  var q = qb.insert(body);
  db.getClient(function(err, client, done) {
    client.query(q[0], q[1], function(err, r) {
      if(err) {
        if(err.code == 23505) {
          err = new exceptions.AlreadyExists();
        }
        cb(err);
      } else {
        cb(null, r.rows[0]);
      }
      done();
    });
  });
}
exports.create = create;

/**
 * Updates post with `id`
 *
 * `cb` is passed the updated post or exceptions.NotFound
 *
 * @param {Number} id
 * @param {Object} body
 * @param {Function} cb
 */

function update(id, body, cb) {
  body.updated_at = new Date();

  var q = qb.update(id, body);
  db.getClient(function(err, client, done) {
    client.query(q[0], q[1], function(err, r) {
      var result = r && r.rows[0];
      if(!err && !result) err = new exceptions.NotFound();
      if(err) {
        cb(err);
      } else {
        cb(null, result);
      }
      done();
    });
  });
}
exports.update = update;

/**
 * Deletes post with `id`
 *
 * `cb` is passed the number of affected rows or exceptions.NotFound
 *
 * @param {Number} id
 * @param {Function} cb
 */

function del(id, cb) {
  db.getClient(function(err, client, done) {
    client.query(DELETE_ID, [id], function(err, r) {
      var result = r && r.rowCount;
      if(!err && !result) err = new exceptions.NotFound();
      if(err) {
        cb(err);
      } else {
        cb(null, r.rowCount);
      }
    });
  });
}
exports.del = del;

/**
 * Finds published posts
 *
 * @param {Object} options
 * @param {Function} cb
 */

function allPublished(options, cb) {
  var q,
      page = Number(options.page) || 1,
      limit = Number(options.limit) || conf.objects_by_page,
      offset = (page - 1) * limit;

  countPublished(function(err, count) {
    if(err) return cb(err);

    q = qb.select();
    q += ' WHERE published = true';
    q += ' LIMIT ' + limit + ' OFFSET ' + offset;

    db.getClient(function(err, client, done) {
      client.query(q, function(err, r) {
        if(err) {
          cb(err);
        } else {
          cb(null, {
            page: page,
            rows: r.rows,
            count: count,
            limit: limit,
            offset: offset
          });
        }
        done();
      });
    });
  });

}
exports.allPublished  = allPublished;

/**
 * Finds all posts, used for admin only
 *
 * @param {Object} options
 * @param {Function} cb
 */

function all(options, cb) {
  var q,
      page = Number(options.page) || 1,
      limit = Number(options.limit) || conf.objects_by_page,
      offset = (page - 1) * limit;

  count(function(err, count) {
    if(err) return cb(err);

    q = qb.select();
    q += ' LIMIT ' + limit + ' OFFSET ' + offset;

    db.getClient(function(err, client, done) {
      client.query(q, function(err, r) {
        if(err) {
          cb(err);
        } else {
          cb(null, {
            rows: r.rows,
            count: count,
            limit: limit,
            offset: offset,
            page: page
          });
        }
        done();
      });
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
  db.getClient(function(err, client, done) {
    client.query(SELECT_COUNT + ' WHERE published = true', function(err, r) {
      if(err) {
        cb(err);
      } else {
        cb(null, r.rows[0].count);
      }
      done();
    });
  });
}
exports.countPublished = countPublished;

/**
 * Counts all posts, used for admin only
 *
 * @param {Function} cb
 */

function count(cb) {
  db.getClient(function(err, client, done) {
    client.query(SELECT_COUNT, function(err, r) {
      if(err) {
        cb(err);
      } else {
        cb(null, r.rows[0].count);
      }
      done();
    });
  });
}
exports.count = count;

/**
 * Returns all published posts without pagination support
 *
 * @param {Function} cb
 */

function archive(cb) {
  db.getClient(function(err, client, done) {
    client.query(qb.select() + ' WHERE published = true', function(err, r) {
      if(err) {
        cb(err);
      } else {
        cb(null, r.rows);
      }
      done();
    });
  });
}
exports.archive = archive;