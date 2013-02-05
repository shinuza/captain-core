var crypto = require('crypto');

var _ = require('underscore');

var exceptions = require('../exceptions');
var util = require('../util');
var models = require('../models');


// Resources
function create(req, res, next) {
  var body = req.body;

  models.users.create(body, function(err, user) {
    if(err) {
      if(err.code == 23505) {
        err = new exceptions.AlreadyExists();
      }
      next(err);
    } else {
      res.json(201, user);
    }
  });
}
exports.create = util.loginRequired(create);

function update(req, res, next) {
  var body = req.body;

  models.users.update(req.params.user, body, function(err, user) {
    if(err) return next(err);
    if(!user) {
      next(new exceptions.NotFound());
    } else {
      res.json(201, user);
    }
  });
}
exports.update = util.loginRequired(update);

function index(req, res) {
  User.all({limit: req.query.limit, offset: req.query.offset})
    .success(res.json.bind(res))
    .error(onError(res));
}
exports.index = util.loginRequired(index);

function show(req, res, next) {
  models.users.find(req.params.user, function(err, user) {
    if(_.size(user) === 0) {
      next(new exceptions.NotFound);
    } else {
      res.json(user);
    }
  });
}
exports.show = util.loginRequired(show);

function destroy(req, res, next) {
  models.users.del(req.params.user, function(err, deleted) {
    if(err) return next(err);
    if(deleted === 0) {
      next(new exceptions.NotFound());
    } else {
      res.send(204);
    }
  });
}
exports.destroy = util.loginRequired(destroy);

// Associations

function setPosts(req, res, next) {
  if(!util.isArray(req.body)) {
    next(new exceptions.BadRequest);
  } else {
    findByUsername(req.params.user, function(user) {
      if(user === null) {
        next(new exceptions.NotFound);
      } else {
        var ids = util.pluck(req.body, 'id');
        Post.findAll({where: {id: ids}}).success(function(posts) {
          user.setPosts(posts).success(function() {
            res.json(201, {ok: true});
          }).error(onError(res));
        }).error(onError(res));
      }
    }, onError(res));
  }
}

function getPosts(req, res, next) {
  findByUsername(req.params.user, function(user) {
    if(user === null) {
      next(new exceptions.NotFound);
    } else {
      user.getPosts().success(function(posts) {
        res.json(posts);
      }).error(onError(res));
    }
  }, onError(res))
}

exports.posts = {
  'set': util.loginRequired(setPosts),
  'get': util.loginRequired(getPosts)
};