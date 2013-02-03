var _ = require('underscore');

var exceptions = require('../exceptions');
var util = require('../util');
var models = require('../models');
var signals = require('../signals');

// Resources
function create(req, res, next) {
  var body = req.body;
  var slug = util.slugify(body.title);

  models.tags.findBySlug(slug, function(err, tag) {
    if(err) return next(err);

    if(tag) {
      res.json(201, tag);
    } else {
      models.tags.create(req.body, function(err, tag) {
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

  models.tags.update(req.params.tag, body, function(err, tag) {
    if(err) {
      next(err);
    } else {
      if(_.size(tag) === 0) {
        next(new exceptions.NotFound);
      } else {
        res.json(201, tag);
        signals.emit('tag:update', tag);
      }
    }
  });
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
  models.tags.find(req.params.tag, function(err, tag) {
    if(err) return next(err);
    if(!tag) {
      next(new exceptions.NotFound);
    } else {
      res.json(tag);
    }
  });
}
exports.show = util.loginRequired(show);

function destroy(req, res, next) {
  models.tags.del(req.params.tag, function(err, deleted) {
    if(err) return next(err);
    if(deleted === 0) {
      next(new exceptions.NotFound);
    } else {
      res.send(204);
      signals.emit('tag:destroy', req.params.post);
    }
  });
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