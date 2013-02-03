var pg = require('pg');

var settings = require('../settings');
var util = require('../util');

var table = 'posts_tags';
var INSERT = 'INSERT INTO ' + table + ' (post_id, tag_id) VALUES ($1, $2)';
var UPDATE_TAG = 'UPDATE ' + table + ' SET post_id = $1, tag_id = $2 WHERE tag_id = $3';
var UPDATE_POST = 'UPDATE ' + table + ' SET post_id = $1, tag_id = $2 WHERE post_id = $3';
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

function updateTag(body, cb) {
  pg.connect(settings.get('DB'), function(err, client) {
    if(err) return cb(err);

    client.query(UPDATE_TAG, [body.tag_id, body.post_id, body.tag_id], function(err, r) {
      if(err) {
        cb(err);
      } else {
        cb(null, r.rows[0]);
      }
    });
  });
}
exports.updateTag = updateTag;

function updatePost(body, cb) {
  pg.connect(settings.get('DB'), function(err, client) {
    if(err) return cb(err);

    client.query(UPDATE_POST, [body.post_id, body.tag_id, body.post_id], function(err, r) {
      if(err) {
        cb(err);
      } else {
        cb(null, r.rows[0]);
      }
    });
  });
}
exports.updatePost = updatePost;

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