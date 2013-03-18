var _ = require('underscore');

var schema = require('js-schema');

var settings = require('../settings'),
    util = require('../util'),
    query = require('../db').query;


var table = 'posts_tags',
    INSERT = 'INSERT INTO ' + table + ' (post_id, tag_id) VALUES ($1, $2)',
    DELETE = 'DELETE FROM ' + table + ' WHERE post_id = $1 AND tag_id = $2';

var Schema = schema({
  post_id: Number,
  tag_id: Number
});

/**
 * Creates a Post <-> Tag association
 *
 * @param {Object} body
 * @param {Function} cb
 */

function create(body, cb) {
  var validates = Schema(body);

  if(!validates) {
    return cb(new exceptions.BadRequest());
  }

  query(INSERT, [body.post_id, body.tag_id], function(err, r) {
    if(err) {
      cb(err);
    } else {
      cb(null, r.rows[0]);
    }
  });
}
exports.create = create;

/**
 * Deletes a Post <-> Tag association
 *
 * @param {Object} body
 * @param {Function} cb
 */

function del(body, cb) {
  query(DELETE, [body.post_id, body.tag_id], function(err, r) {
    if(err) {
      cb(err);
    } else {
      cb(null, r.rowCount);
    }
  });
}
exports.del = del;

/**
 * Gets posts associated with tag with id `id`
 *
 * @param {Number} id
 * @param {Function} cb
 */

function tagGetPosts(id, cb) {
  var q  =
    'SELECT * FROM posts p ' +
    'JOIN posts_tags pt ON p.id = pt.post_id AND pt.tag_id = $1';
  query(q, [id], function(err, r) {
    if(err) return cb(err);
    else cb(null, r.rows);
  });
}
exports.tagGetPosts = tagGetPosts;

/**
 * Gets tags associated with posts with id `id`
 *
 * @param {Number} id
 * @param {Function} cb
 */

function postGetTags(id, cb) {
  var q  =
    'SELECT * FROM tags t ' +
      'JOIN posts_tags pt ON t.id = pt.tag_id AND pt.post_id = $1';
  query(q, [id], function(err, r) {
    if(err) return cb(err);
    else cb(null, r.rows);
  });
}
exports.postGetTags = postGetTags;

/**
 * Removes existing association and associates `tags` with post with id `post_id`
 *
 * @param {Number} post_id
 * @param {Array} tags
 * @param {Function} cb
 */

function postSetTags(post_id, tags, cb) {
  var ids = _.pluck(tags, 'id');
  var q1 = 'DELETE FROM posts_tags WHERE post_id = $1';
  var q2 = 'INSERT INTO posts_tags (post_id, tag_id) VALUES ' +
    ids.map(function(id) {
      return '(' + post_id + ',' + id + ')';
    }).join(', ');

  query(q1, [post_id], function(err, r) {
    if(err) return cb(err);
    query(q2, [], function(err, r) {
      if(err) return cb(err);
      else cb(null, r.rowCount);
    });
  });
}
exports.postSetTags = postSetTags;