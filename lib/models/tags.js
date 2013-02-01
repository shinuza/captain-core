var settings = require('../settings');
var gesundheit = require('gesundheit');

/*
 CREATE TABLE `tags` (
 `id`  INTEGER PRIMARY KEY AUTO_INCREMENT,
 `title` VARCHAR(255) NOT NULL,
 `slug` VARCHAR(255) NOT NULL UNIQUE
 );
 */

var db = gesundheit.engine(settings.get('DB'));
gesundheit.defaultEngine = db;

var select = gesundheit.select('tags', ['id', 'title', 'slug']);
var update = gesundheit.update('tags');
var del = gesundheit.delete('tags');

function countBySlug(slug, cb) {

}
exports.countBySlug = countBySlug;

function findBySlug(slug, cb) {
  var query = select.copy().where({slug: slug});
  query.execute(function(err, result) {
    cb(null, result.rows[0]);
  });
}
exports.findBySlug = findBySlug;

function findById(id, cb) {
  var query = select.copy().where({id: id});
  query.execute(function(err, result) {
    cb(null, result.rows[0]);
  });
}
exports.findById = findById;

function findByAuto(param) {
  var fn, asInt = parseInt(param, 10);
  fn = isNaN(asInt) ? findBySlug : findById;
  fn.apply(null, arguments);
}
exports.findByAuto = findByAuto;

function create(body, cb) {
  var query = gesundheit.insert('tags', body);
  query.execute(function(err) {
    if(err) {
      cb(err);
    } else {
      findBySlug(body.slug, cb);
    }
  });
}
exports.create = create;