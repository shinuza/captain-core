var crypto = require('crypto');

var errors = require('../errors');
var util = require('../util');
var models = require('../models');

var Post = models.Post,
    User = models.User,
    Token = models.Token,
    onError = util.onError;


// Functions
function createUser(username, password, cb) {
  util.encode(password, function(err, derivedKey) {
    if(err) return cb(err);
    User.create({'username': username, 'password': derivedKey}).success(cb).error(function(err) {
      throw err;
    });
  });
}
exports.createUser = createUser;

function getToken(token, success, error) {
  Token.find({token: token}).success(success).error(error);
}
exports.getToken = getToken;

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
exports.create = function create(req, res) {
  var body = req.body;

  if(req.session) {
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
  } else {
    res.json(403, errors.permissionRequired);
  }
};

exports.update = function update(req, res) {
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
};

exports.index = function index(req, res) {
  User.all({limit: req.query.limit, offset: req.query.offset})
    .success(res.json.bind(res))
    .error(onError(res));
};

exports.show = function show(req, res) {
  findByUsername(req.params.user, function(user) {
    if(user === null) {
      res.json(404, errors.notFound);
    } else {
      res.json(user);
    }
  }, onError(res));
};

exports.destroy = function destroy(req, res) {
  findById(req.params.user, function(user) {
    if(user === null) {
      res.json(404, errors.notFound);
    } else {
      user.destroy().success(function() {
        res.send(204);
      }).error(onError(res));
    }
  }, onError(res));
};

exports.login = function login(req, res, next) {
  var token,
      body = req.body;

  findByUsername(body.username, function(user) {
    if(user === null) return res.send(403, errors.authenticationFailed);

    util.compare(body.password, user.password, function(err, matches) {
      if(err) return next(err);

      if(matches === true) {
        crypto.randomBytes(32, function(err, buffer) {
          if (err) return next(err);
          token = buffer.toString('hex');

          Token.create({token: token}).success(function(t) {
            user.setToken(t).success(function() {
              res.cookie('token', token);
              res.send(user);
              // Don't wait on this
              user.updateAttributes({lastLogin: new Date}).error(util.log);
            }).error(onError(res))
          }).error(onError(res));
        });
      } else {
        res.send(403, errors.authenticationFailed);
      }
    });
  }, onError(res));
};

exports.logout = function logout(req, res) {
  res.clearCookie('token');
  res.send({ok: true});
};


// Associations

exports.posts = {
  associate: function(req, res) {
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
  },

  list: function(req, res) {
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
};