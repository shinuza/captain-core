var _ = require('underscore');

var settings = require('../settings');
var util = require('../util');
var query = require('../db').query;

var table = 'posts_tags';
var INSERT = 'INSERT INTO ' + table + ' (post_id, tag_id) VALUES ($1, $2)';
var DELETE = 'DELETE FROM ' + table + ' WHERE post_id = $1 AND tag_id = $2';

function create(body, cb) {
  query(INSERT, [body.post_id, body.tag_id], function(err, r) {
    if(err) {
      cb(err);
    } else {
      cb(null, r.rows[0]);
    }
  });
}
exports.create = create;

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