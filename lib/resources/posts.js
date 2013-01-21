var errors = require('../errors');
var util = require('../util');
var models = require('../models');
var settings = require('../settings');

var Tag = models.Tag,
    Post = models.Post,
    logging = models.logging,
    onError = util.onError;

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
      next(new errors.AlreadyExists);
    } else {
      Post.create(body)
        .success(function(post) {
          post.setUser(req.session.user);
          res.json(201, post);
        })
        .error(onError(res));
    }
  }, onError(res));
}
exports.create = util.loginRequired(create);

function update(req, res, next) {
  var body = req.body;

  findById(req.params.post, function(post) {
    if(post === null) {
      next(new errors.NotFound);
    } else {
      post.updateAttributes(body).success(function() {
        res.json(201, {ok: true});
      }).error(onError(res));
    }
  }, onError(res));
}
exports.update = util.loginRequired(update);

exports.index = function index(req, res) {
  var options = {};
  if(!req.session) {
    options.where = { published: true };
  }

  Post.count(options).success(function(count) {
    var page = req.query.page ? parseInt(req.query.page, 10) : 1;
    options.limit = POSTS_BY_PAGE;
    options.offset = (page - 1) * POSTS_BY_PAGE;
    options.order = 'id DESC';

    var next = count - (options.limit + options.offset) > 0;
    var previous = page > 1;

    Post.findAll(options)
      .success(function(posts) {
        res.format({
          'text/html': function() {
            res.render('posts/index', {
              page: page,
              count: count,
              posts: posts,
              next: next,
              previous: previous
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
      next(new errors.NotFound);
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
      next(new errors.NotFound);
    } else {
      post.destroy().success(function() {
        res.send(204);
      }).error(onError(res));
    }
  }, onError(res));
}
exports.destroy = util.loginRequired(destroy);

// Associations

function setUser(req, res, next) {
  findById(req.params.post, function(post) {
    if(post === null) {
      next(new errors.NotFound);
    } else {
      if(!req.body.id) {
        next(new errors.BadRequest);
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
      next(new errors.NotFound);
    } else {
      post.getUser().success(function(user) {
        res.json(user)
      }).error(onError(res));
    }
  }, onError(res));
}

function getTags(req, res) {
  findById(req.params.post, function(post) {
    if(post === null) {
      res.json(404, errors.notFound);
    } else {
      post.getTags().success(function(tags) {
        res.json(tags);
      }).error(onError(res));
    }
  }, onError(res));
}

function setTags(req, res) {
  findById(req.params.post, function(post) {
    if(post === null) {
      res.json(404, errors.notFound);
    } else {
      if(!util.isArray(req.body.data)) {
        res.json(400, errors.badRequest);
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