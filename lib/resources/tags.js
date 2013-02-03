var exceptions = require('../exceptions');
var util = require('../util');
var models = require('../models');
var signals = require('../signals');

var isArray = require('util').isArray;

// Resources
function create(req, res, next) {
  var body = req.body;
  body.slug = util.slugify(body.title);

  //TODO: Validation
  models.tags.create(body, function(err, tag) {
    if(err) {
      next(err);
    } else {
      res.json(201, tag);
      signals.emit('tag:create', tag);
    }
  });
}
exports.create = util.loginRequired(create);


function update(req, res, next) {
  var body = req.body;

}
exports.update = util.loginRequired(update);

exports.index = function index(req, res) {
  models.tags.all(function(err, tags) {
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
  models.tags.findBySlug(req.params.tag, function(err, post) {
    if(err) return next(err);
    if(!post) {
      next(new exceptions.NotFound);
    } else {
      res.json(post);
    }
  });
}
exports.show = util.loginRequired(show);

function destroy(req, res, next) {
  findById(req.params.tag, function(tag) {
    if(tag === null) {
      next(new exceptions.NotFound);
    } else {
      tag.destroy().success(function() {
        res.send(204);
        signals.emit('tag:destroy', req.params.tag);
      }).error(onError(res));
    }
  }, onError(res));
}
exports.destroy = util.loginRequired(destroy);

// Associations

function getPosts(req, res, next) {
  findBySlug(req.params.tag, function(tag) {
    if(tag === null) {
      next(new exceptions.NotFound);
    } else {
      tag.getPosts().success(function(posts) {
        res.format({
          'text/html': function() {
            res.render('tags/show', {posts: posts, tag: tag});
          },
          'application/json': function() {
            res.json(posts);
          }
        });
      }).error(onError(res));
    }
  }, onError(res));
}

exports.posts = {
  'get': getPosts
};