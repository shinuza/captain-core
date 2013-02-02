var exceptions = require('../exceptions');
var util = require('../util');
var models = require('../models');
var settings = require('../settings');
var signals = require('../signals');

const POSTS_BY_PAGE = settings.get('POSTS_BY_PAGE');

function countBySlug(slug, success, error) {
  Post.count({where: {slug: slug}}).success(success).error(error);
}
exports.countBySlug = countBySlug;

function findBySlug(slug, success, error) {
  Post.find({where: {slug: slug}}).success(success).error(error);
}
exports.findBySlug = findBySlug;

function findById(id, success, error) {
  Post.find(id).success(success).error(error);
}
exports.findById = findById;

function findByAuto(param) {
  var fn, asInt = parseInt(param, 10);
  fn = isNaN(asInt) ? findBySlug : findById;
  fn.apply(null, arguments);
}
exports.findByAuto = findByAuto;

// Resources
function create(req, res, next) {
  var body = req.body;
  body.slug = util.slugify(body.title);

  countBySlug(body.slug, function count(count) {
    if(count > 0) {
      next(new exceptions.AlreadyExists);
    } else {
      var post = Post.build(body);
      var errors = post.validate();

      if(errors) {
        res.json(400, errors);
      } else {
        post.save().success(function(post) {
          post.setUser(req.session.user);
          res.json(201, post);
          signals.emit('post:create', post);
        }).error(onError(res));
      }
    }
  }, onError(res));
}
exports.create = util.loginRequired(create);

function update(req, res, next) {
  var body = req.body;

  findById(req.params.post, function(post) {
    if(post === null) {
      next(new exceptions.NotFound);
    } else {
      post.updateAttributes(body).success(function() {
        res.json(201, body);
        signals.emit('post:update', body);
      }).error(onError(res));
    }
  }, onError(res));
}
exports.update = util.loginRequired(update);

exports.index = function index(req, res) {
  var page = 1, prev = false, next = false;
  var options = { order: 'id DESC' };
  var links = {};

  if(!req.session) {
    options.where = { published: true };
  }

  Post.count(options).success(function(count) {
    if(!req.session) {
      page = req.query.page ? parseInt(req.query.page, 10) : 1;

      options.limit = POSTS_BY_PAGE;
      options.offset = (page - 1) * POSTS_BY_PAGE;

      next = count - (options.limit + options.offset) > 0;
      prev = page > 1;

      if(next) links.next = req.url + '?page=' + (page + 1);
      if(prev) links.prev = req.url + '?page=' + (page - 1);

      res.links(links);
    }

    Post.findAll(options)
      .success(function(posts) {
        res.format({
          'text/html': function() {
            res.render('posts/index', {
              links: links,
              page: page,
              count: count,
              posts: posts,
              next: next,
              prev: prev
            });
          },
          'application/json': function() {
            res.json(posts);
          }
        });
      })
      .error(onError(res));
  }).error(onError(res));
};

exports.show = function show(req, res, next) {
  findByAuto(req.params.post, function(post) {
    if(post === null) {
      next(new exceptions.NotFound);
    } else {
      res.format({
        'text/html': function() {
          res.render('posts/show', {post: post});
        },
        'application/json': function() {
          res.json(post);
        }
      });
    }
  }, onError(res));
};

function destroy(req, res, next) {
  findById(req.params.post, function(post) {
    if(post === null) {
      next(new exceptions.NotFound);
    } else {
      post.destroy().success(function() {
        res.send(204);
        signals.emit('post:destroy', req.params.post);
      }).error(onError(res));
    }
  }, onError(res));
}
exports.destroy = util.loginRequired(destroy);

// Associations

function setUser(req, res, next) {
  findById(req.params.post, function(post) {
    if(post === null) {
      next(new exceptions.NotFound);
    } else {
      if(!req.body.id) {
        next(new exceptions.BadRequest);
      } else {
        post.setUser(req.body).success(function() {
          res.json(201, {ok: true});
        }).error(onError(res));
      }
    }
  }, onError(res));
}

function getUser(req, res, next) {
  findById(req.params.post, function(post) {
    if(post === null) {
      next(new exceptions.NotFound);
    } else {
      post.getUser().success(function(user) {
        res.json(user)
      }).error(onError(res));
    }
  }, onError(res));
}

function getTags(req, res, next) {
  findById(req.params.post, function(post) {
    if(post === null) {
      next(new exceptions.NotFound);
    } else {
      post.getTags().success(function(tags) {
        res.json(tags);
      }).error(onError(res));
    }
  }, onError(res));
}

function setTags(req, res, next) {
  findById(req.params.post, function(post) {
    if(post === null) {
      next(new exceptions.NotFound);
    } else {
      if(!util.isArray(req.body.data)) {
        next(new exceptions.BadRequest);
      } else {
        var ids = util.pluck(req.body.data, 'id');
        Tag.findAll({where: { id: ids }}).success(function(tags) {
          post.setTags(tags).success(function() {
            res.json(201, {ok: true});
          }).error(onError(res));
        }).error(onError(res));
      }
    }
  }, onError(res));
}

exports.user = {
  'set': util.loginRequired(setUser),
  'get': util.loginRequired(getUser)
};

exports.tags = {
  'get': util.loginRequired(getTags),
  'set': util.loginRequired(setTags)
};