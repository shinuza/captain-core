var _ = require('underscore');

var exceptions = require('../exceptions');
var util = require('../util');
var db = require('../db');
var signals = require('../signals');

// Resources
function create(req, res, next) {
  var body = req.body;
  var slug = util.slugify(body.title);

  db.tags.findBySlug(slug, function(err, tag) {
    if(err && err.statusCode != 404) return next(err);

    if(tag) {
      res.json(201, tag);
    } else {
      db.tags.create(req.body, function(err, tag) {
        if(err) {
          next(err);
        } else {
          res.json(201, tag);
          signals.emit('tag:create', tag);
        }
      });
    }
  });
}
exports.create = util.loginRequired(create);


function update(req, res, next) {
  var body = req.body;

  db.tags.update(req.params.tag, body, function(err, tag) {
    if(err) return next(err);

    res.json(201, tag);
    signals.emit('tag:update', tag);
  });
}
exports.update = util.loginRequired(update);

exports.index = function index(req, res) {
  db.tags.all(function(err, tags) {
    if(err) return next(err);
    res.format({
      'text/html': function() {
        res.render('tags/index', {tags: tags});
      },
      'application/json': function() {
        res.json(tags);
      }
    });
  });
};

function show(req, res, next) {
  db.tags.find(req.params.tag, function(err, tag) {
    if(err) return next(err);
    res.json(tag);
  });
}
exports.show = util.loginRequired(show);

function destroy(req, res, next) {
  db.tags.del(req.params.tag, function(err) {
    if(err) return next(err);
      res.send(204);
      signals.emit('tag:destroy', req.params.post);
  });
}
exports.destroy = util.loginRequired(destroy);

// Associations

function getPosts(req, res, next) {
  db.tags.find(req.params.tag, function(err, tag) {
    if(err) return next(err);

    db.posts_tags.tagGetPosts(tag.id, function(err, posts) {
      if(err) return next(err);
      res.format({
        'text/html': function() {
          res.render('tags/show', {posts: posts, tag: tag});
        },
        'application/json': function() {
          res.json(posts);
        }
      });
    });
  });
}

exports.posts = {
  'get': getPosts
};