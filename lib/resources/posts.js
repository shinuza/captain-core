var exceptions = require('../exceptions');
var util = require('../util');
var models = require('../models');
var settings = require('../settings');
var signals = require('../signals');

const POSTS_BY_PAGE = settings.get('POSTS_BY_PAGE');

// Resources
function create(req, res, next) {
  var body = req.body;
  body.user_id = req.session.user.id;

  models.posts.create(req.body, function(err, post) {
    if(err) {
      next(err);
    } else {
      res.json(201, post);
    }
  });
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
  var page = 1,
      prev = false,
      next = false,
      limit,
      offset;
  var links = {};

  var query = 'SELECT * FROM posts';
  var counter = req.session ? models.posts.count : models.posts.countPublished;
  if(req.session) {
    query += ' WHERE PUBLISHED = true ';
  }


  counter(function(count) {
    page = req.query.page ? parseInt(req.query.page, 10) : 1;

    limit = POSTS_BY_PAGE;
    offset = (page - 1) * POSTS_BY_PAGE;

    next = count - (limit + offset) > 0;
    prev = page > 1;

    if(next) links.next = req.url + '?page=' + (page + 1);
    if(prev) links.prev = req.url + '?page=' + (page - 1);

    res.links(links);
    query += ' LIMIT ' + limit + ' OFFSET ' + offset;

    models.posts.query(query, function(err, posts) {
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
      });
  });
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