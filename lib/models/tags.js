var pg = require('pg');

var settings = require('../settings');
var util = require('../util');
var QueryBuilder = require('./query_builder');

/*
 CREATE TABLE tags (
 id SERIAL,
 title character varying(255) NOT NULL,
 slug character varying(255) NOT NULL UNIQUE,
 CONSTRAINT tags_pkey PRIMARY KEY (id)
 )
 */


var qb = new QueryBuilder('tags', ['id', 'title', 'slug']);
var SELECT_SLUG = qb.select() + ' WHERE slug = $1';
var SELECT_ID = qb.select() + ' WHERE id = $1';
var DELETE_ID = qb.del() + ' WHERE id = $1';


function find(param) {
  var fn, asInt = parseInt(param, 10);
  fn = isNaN(asInt) ? findBySlug : findById;
  fn.apply(null, arguments);
}
exports.find = find;

function findBySlug(slug, cb) {
  pg.connect(settings.get('DB'), function(err, client) {
    if(err) return cb(err);
    client.query(SELECT_SLUG, [slug], function(err, r) {
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
    client.query(SELECT_ID, [id], function(err, r) {
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

    var query = qb.insert(body);
    client.query(query[0], query[1], function(err, r) {
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

    var query = qb.update(id, body);
    client.query(query[0], query[1], function(err, r) {
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
    client.query(qb.select(), function(err, r) {
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
    client.query(DELETE_ID, [id], function(err, r) {
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