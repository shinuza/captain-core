var schema = require('js-schema');

var settings = require('../settings'),
    util = require('../util'),
    QueryBuilder = require('./../query_builder'),
    query = require('../db').query,
    exceptions = require('../exceptions');

var qb = new QueryBuilder('tags', ['id', 'title', 'slug']),
    SELECT_SLUG = qb.select() + ' WHERE slug = $1',
    SELECT_ID = qb.select() + ' WHERE id = $1',
    DELETE_ID = qb.del() + ' WHERE id = $1';

var Schema = schema({
  title: String
});

/**
 * Smart find, uses findBySlug or findBy id depending on `param` type
 * @param {String, Number} param
 */

function find(param) {
  var fn, asInt = parseInt(param, 10);
  fn = isNaN(asInt) ? findBySlug : findById;
  fn.apply(null, arguments);
}
exports.find = find;

/**
 * Finds a tag by `slug`
 * cb` is passed with the matching tag, or:
 *   - exceptions.NotFound if the `slug` is not found in the database
 *
 * @param {String} slug
 * @param {Function} cb
 */

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

/**
 * Finds a tag by `id`
 * cb` is passed with the matching tag, or:
 *   - exceptions.NotFound if the `id` is not found in the database
 *
 * @param id
 * @param cb
 */

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

/**
 * Creates a new tag.
 * `cb` is passed with the newly created tag, or:
 *   - exceptions.BadRequest: if the `body` does not satisfy the schema
 *   - exceptions.AlreadyExists: if a tag with the same slug already exists
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
 * Updates tag with `id`
 * `cb` is passed with the updated tag, or:
 *   - exceptions.NotFound if the `id` is not found in the database
 *
 * @param {Number} id
 * @param {Object} body
 * @param {Function} cb
 */

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

/**
 * Finds all tags
 * @param {Function} cb
 */

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

/**
 * Deletes tag with `id`
 * * `cb` is passed with the number of affected rows, or:
 *   - exceptions.NotFound if the `id` is not found in the database
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