var pg = require('pg');
var uuid = require('node-uuid');

var settings = require('../settings');
var util = require('../util');

/*
 CREATE TABLE posts (
 id serial,
 uuid VARCHAR(50) NOT NULL UNIQUE,
 title VARCHAR(255) NOT NULL,
 slug VARCHAR(255) NOT NULL UNIQUE,
 summary TEXT,
 body TEXT NOT NULL,
 published BOOLEAN NOT NULL DEFAULT false,
 created_at TIMESTAMP NOT NULL,
 updated_at TIMESTAMP,
 user_id INTEGER NOT NULL,
 CONSTRAINT posts_pkey PRIMARY KEY (id)
 );
 */

const INSERT_QUERY =
  "INSERT INTO posts (uuid, title, slug, summary, body, published, created_at, user_id)" +
  "VALUES ($1, $2, $3, $4, $5, $6, $7, $8)" +
  "RETURNING id, uuid, title, slug, summary, body, published, created_at, user_id";
const SELECT_SLUG_QUERY = "SELECT * FROM posts WHERE slug = $1";
const SELECT_ID_QUERY = "SELECT * FROM posts WHERE id = $1";

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
    var params = [uuid.v4(), body.title, body.slug, body.summary, body.body, body.published, new Date(), body.user_id];

    client.query(INSERT_QUERY, params, function(err, r) {
      if(err) {
        cb(err);
      } else {
        cb(null, r.rows[0]);
      }
    });
  });
}
exports.create = create;