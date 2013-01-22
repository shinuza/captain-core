var crypto = require('crypto');

var exceptions = require('../exceptions');
var util = require('../util');
var models = require('../models');

var Post = models.Post,
    User = models.User,
    Token = models.Token,
    onError = util.onError;


// Functions
function createUser(body, cb) {
  util.encode(body.password, function(err, derivedKey) {
    if(err) return cb(err);
    body.password = derivedKey;
    User.create(body).success(cb).error(function(err) {
      throw err;
    });
  });
}
exports.createUser = createUser;

function countByUsername(username, success, error) {
  User.count({where: {username: username}}).success(success).error(error);
}
exports.countByUsername = countByUsername;

function findByUsername(username, success, error) {
  User.find({where: {username: username}}).success(success).error(error);
}
exports.findByUsername = findByUsername;

function findByToken(token, success, error) {
  User.find({where: {token: token}}).success(success).error(error);
}
exports.findByToken = findByToken;

function findById(id, success, error) {
  User.find(id).success(success).error(error);
}
exports.findById = findById;


// Resources
function create(req, res, next) {
  var body = req.body;
  countByUsername(body.username, function(count) {
    if(count > 0) {
      next(new exceptions.AlreadyExists());
    } else {
      util.encode(body.password, function(err, derivedKey) {
        body.password = derivedKey;

        var user = User.build(body);
        var errors = user.validate();

        if(errors) {
          res.json(400, errors);
        } else {
          user.save().success(function(user) {
            res.json(201, user);
          }).error(onError(res));
        }
      });
    }
  }, onError(res));
}
exports.create = util.loginRequired(create);

function update(req, res, next) {
  var body = req.body;

  findById(req.params.user, function(user) {
    function update(body) {
      user.updateAttributes(body).success(function() {
        res.json(201, {ok: true});
      }).error(onError(res));
    }

    if(user === null) {
      next(new exceptions.NotFound);
    } else {
      if(body.password) {
        util.encode(body.password, function(err, derivedKey) {
          body.password = derivedKey;
          update(body);
        });
      } else {
        update(body)
      }
    }
  }, onError(res));
}
exports.update = util.loginRequired(update);

function index(req, res) {
  User.all({limit: req.query.limit, offset: req.query.offset})
    .success(res.json.bind(res))
    .error(onError(res));
}
exports.index = util.loginRequired(index);

function show(req, res, next) {
  findByUsername(req.params.user, function(user) {
    if(user === null) {
      next(new exceptions.NotFound);
    } else {
      res.json(user);
    }
  }, onError(res));
}
exports.show = util.loginRequired(show);

function destroy(req, res, next) {
  findById(req.params.user, function(user) {
    if(user === null) {
      next(new exceptions.NotFound);
    } else {
      user.destroy().success(function() {
        res.send(204);
      }).error(onError(res));
    }
  }, onError(res));
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