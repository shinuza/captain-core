var pg = require('pg');

var settings = require('../settings');
var util = require('../util');

var table = 'posts_tags';
var INSERT = 'INSERT INTO ' + table + ' (post_id, tag_id) VALUES ($1, $2)';
var DELETE = 'DELETE FROM ' + table + ' WHERE post_id = $1 AND tag_id = $2';

function create(body, cb) {
  pg.connect(settings.get('DB'), function(err, client) {
    if(err) return cb(err);

    client.query(INSERT, [body.post_id, body.tag_id], function(err, r) {
      if(err) {
        cb(err);
      } else {
        cb(null, r.rows[0]);
      }
    });
  });
}
exports.create = create;

function del(body, cb) {
  pg.connect(settings.get('DB'), function(err, client) {
    if(err) return cb(err);
    client.query(DELETE, [body.post_id, body.tag_id], function(err, r) {
      if(err) {
        cb(err);
      } else {
        cb(null, r.rowCount);
      }
    });
  });
}
exports.del = del;

function query(query, args, cb) {
  pg.connect(settings.get('DB'), function(err, client) {
    if(err) return cb(err);
    client.query(query, args, cb);
  });
}
exports.query = query;

function tagGetPosts(id, cb) {
  var q  =
    'SELECT * FROM posts p ' +
      'JOIN tags t ON t.id = $1 ' +
      'JOIN posts_tags pt ON p.id = pt.post_id AND t.id = pt.tag_id';
  query(q, [id], function(err, r) {
    if(err) return cb(err);
    else cb(null, r.rows);
  });
}
exports.tagGetPosts = tagGetPosts;

function postGetTags(id, cb) {
  var q  =
    'SELECT * FROM tags t ' +
    'JOIN posts_tags pt ON $1 = pt.post_id AND t.id = pt.tag_id';
  query(q, [id], function(err, r) {
    if(err) return cb(err);
    else cb(null, r.rows);
  });
}
exports.postGetTags = postGetTags;