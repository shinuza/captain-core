var pg = require('pg');

var settings = require('../settings');
var util = require('../util');
/*
 CREATE TABLE tags (
 id SERIAL,
 title character varying(255) NOT NULL,
 slug character varying(255) NOT NULL UNIQUE,
 CONSTRAINT tags_pkey PRIMARY KEY (id)
 )
 */

const INSERT_QUERY = "INSERT INTO tags (title, slug) VALUES ($1, $2) RETURNING id, title, slug";
const UPDATE_QUERY = "UPDATE tags SET title = $1 WHERE id = $2 RETURNING id, title, slug";
const SELECT_ALL_QUERY = "SELECT * FROM tags";
const SELECT_SLUG_QUERY = "SELECT * FROM tags WHERE slug = $1";
const SELECT_ID_QUERY = "SELECT * FROM tags WHERE id = $1";
const DELETE_QUERY = "DELETE FROM tags WHERE id = $1";

function find(param) {
  var fn, asInt = parseInt(param, 10);
  fn = isNaN(asInt) ? findBySlug : findById;
  fn.apply(null, arguments);
}
exports.find = find;

function findBySlug(slug, cb) {
  pg.connect(settings.get('DB'), function(err, client) {
    if(err) return cb(err);
    client.query(SELECT_SLUG_QUERY, [slug], function(err, r) {
      if(err) {
        cb(err);
      } else {
        cb(null, r.rows[0]);
      }
    });
  });
}
exports.findBySlug = findBySlug;

function findById(id, cb) {
  pg.connect(settings.get('DB'), function(err, client) {
    if(err) return cb(err);
    client.query(SELECT_ID_QUERY, [id], function(err, r) {
      if(err) {
        cb(err);
      } else {
        cb(null, r.rows[0]);
      }
    });
  });
}
exports.findById = findById;

function create(body, cb) {
  pg.connect(settings.get('DB'), function(err, client) {
    if(err) return cb(err);
    body.slug = util.slugify(body.title);
    client.query(INSERT_QUERY, [body.title, body.slug], function(err, r) {
      if(err) {
        cb(err);
      } else {
        cb(null, r.rows[0]);
      }
    });
  });
}
exports.create = create;

function update(id, body, cb) {
  pg.connect(settings.get('DB'), function(err, client) {
    if(err) return cb(err);
    client.query(UPDATE_QUERY, [body.title, id], function(err, r) {
      if(err) {
        cb(err);
      } else {
        cb(null, r.rows[0]);
      }
    });
  });
}
exports.update = update;

function all(cb) {
  pg.connect(settings.get('DB'), function(err, client) {
    if(err) return cb(err);
    client.query(SELECT_ALL_QUERY, function(err, r) {
      if(err) {
        cb(err);
      } else {
        cb(null, r.rows);
      }
    });
  });
}
exports.all = all;

function del(id, cb) {
  pg.connect(settings.get('DB'), function(err, client) {
    if(err) return cb(err);
    client.query(DELETE_QUERY, [id], function(err, r) {
      if(err) {
        cb(err);
      } else {
        cb(null, r.rowCount);
      }
    });
  });
}
exports.del = del;

function query(query, cb) {
  pg.connect(settings.get('DB'), function(err, client) {
    if(err) return cb(err);
    client.query(query, cb);
  });
}
exports.query = query;