var crypto = require('crypto');

var errors = require('../errors');
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
function create(req, res) {
  var body = req.body;
  countByUsername(body.username, function(count) {
    if(count > 0) {
      res.json(409, errors.alreadyExists);
    } else {
      util.encode(body.password, function(err, derivedKey) {
        body.password = derivedKey;

        User.create(body).success(function(user) {
          res.json(201, user);
        }).error(onError(res));
      });
    }
  }, onError(res));
}
exports.create = util.loginRequired(create);

function update(req, res) {
  var body = req.body;

  findById(req.params.user, function(user) {
    function update(body) {
      user.updateAttributes(body).success(function() {
        res.json(201, {ok: true});
      }).error(onError(res));
    }

    if(user === null) {
      res.json(404, errors.notFound);
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

function show(req, res) {
  findByUsername(req.params.user, function(user) {
    if(user === null) {
      res.json(404, errors.notFound);
    } else {
      res.json(user);
    }
  }, onError(res));
}
exports.show = util.loginRequired(show);

function destroy(req, res) {
  findById(req.params.user, function(user) {
    if(user === null) {
      res.json(404, errors.notFound);
    } else {
      user.destroy().success(function() {
        res.send(204);
      }).error(onError(res));
    }
  }, onError(res));
}
exports.destroy = util.loginRequired(destroy);

// Associations

function associate(req, res) {
  if(!util.isArray(req.body)) {
    res.json(400, errors.badRequest);
  } else {
    findByUsername(req.params.user, function(user) {
      if(user === null) {
        res.json(404, errors.notFound);
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

function list(req, res) {
  findByUsername(req.params.user, function(user) {
    if(user === null) {
      res.json(404, errors.notFound);
    } else {
      user.getPosts().success(function(posts) {
        res.json(posts);
      }).error(onError(res));
    }
  }, onError(res))
}

exports.posts = {
  'associate': util.loginRequired(associate),
  'list': util.loginRequired(list)
};