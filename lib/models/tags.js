var schema = require('js-schema');

var string = require('../util/string'),
    QueryBuilder = require('./../query_builder'),
    exceptions = require('../exceptions'),
    db = require('../db.js');

var qb = new QueryBuilder('tags', ['id', 'title', 'slug']),
    SELECT_SLUG = qb.select() + ' WHERE slug = $1',
    SELECT_ID = qb.select() + ' WHERE id = $1',
    DELETE_ID = qb.del() + ' WHERE id = $1';

/**
 * Schema for creating/updating Tags
 *
 * @param {String} title
 */

var Schema = schema({
  title: String
});

/**
 * Smart find, uses findBySlug or findById
 *
 * @param {*} param
 */

function find(param) {
  var fn, asInt = parseInt(param, 10);
  fn = isNaN(asInt) ? findBySlug : findById;
  fn.apply(null, arguments);
}
exports.find = find;

/**
 * Finds a tag by `slug`
 *
 * `cb` is passed the matching tag or exceptions.NotFound
 *
 * @param {String} slug
 * @param {Function} cb
 */

function findBySlug(slug, cb) {
  db.getClient(function(err, client, done) {
    client.query(SELECT_SLUG, [slug], function(err, r) {
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
exports.findBySlug = findBySlug;

/**
 * Finds a tag by `id`
 *
 * `cb` is passed the matching tag or exceptions.NotFound
 *
 * @param {Number} id
 * @param {Function} cb
 */

function findById(id, cb) {
  db.getClient(function(err, client, done) {
    client.query(SELECT_ID, [id], function(err, r) {
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
exports.findById = findById;

/**
 * Creates a new tag.
 *
 * `cb` is passed the newly created tag, or:
 *
 *   * exceptions.BadRequest: if the `body` does not satisfy the schema
 *   * exceptions.AlreadyExists: if a tag with the same slug already exists
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
 * Updates tag with `id`
 *
 * `cb` is passed the updated tag or exceptions.NotFound
 *
 * @param {Number} id
 * @param {Object} body
 * @param {Function} cb
 */

function update(id, body, cb) {
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
 * Finds all tags that are associated to a post
 *
 * @param {Function} cb
 */

function allWithPosts(cb) {
  var q =
    'SELECT t.id, t.title, t.slug, count(pt.post_id) AS count FROM tags t ' +
    'JOIN "posts_tags" pt ON pt.tag_id = t.id ' +
    'GROUP BY t.id, t.title, t.slug';

  db.getClient(function(err, client, done) {
    client.query(q, function(err, r) {
      cb(err, r.rows);
      done();
    });
  });
}
exports.allWithPosts = allWithPosts;

/**
 * Finds all tags
 *
 * @param {Function} cb
 */

function all(cb) {
  db.getClient(function(err, client, done) {
    client.query(qb.select(), function(err, r) {
      cb(err, r.rows);
      done();
    });
  });
}
exports.all = all;

/**
 * Deletes tag with `id`
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
      done();
    });
  });
}
exports.del = del;

/**
 * Counts tags
 *
 * `cb` is passed the number of rows
 *
 * @param {Function} cb
 */

function count(cb) {
  db.getClient(function(err, client, done) {
    client.query('SELECT count(id) FROM tags', function(err, r) {
      var result = r && r.rows[0].count;
      if(err) {
        cb(err);
      } else {
        cb(null, result);
      }
      done();
    });
  });
}
exports.count = count;