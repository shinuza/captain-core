var crypto = require('crypto');

var settings = require('../settings');
var helpers = require('./helpers');

// Schema
var Schema = require('jugglingdb').Schema;
var schema = new Schema('redis', {port: 6379});

var User = exports.User = schema.define('User', {
  username: {type: String, index: true},
  password: String,
  joined: {type: Date, default: Date.now},
  token: {type: Schema.Text, index: true}
});


// Functions
function createUser(username, password, cb) {
  helpers.encode(password, function(err, derivedKey) {
    if(err) return cb(err);
    User.create({'username': username, 'password': derivedKey}, function(err) {
      if(err) cb(err);
      else cb();
    });
  });
}
exports.createUser = createUser;

function findByUsername(username, cb) {
  User.findOne({where: {'username': username}}, cb);
}
exports.findByUsername = findByUsername;

function findByToken(token, cb) {
  User.findOne({where: {'token': token}}, cb);
}
exports.findByToken = findByToken;


// Resources
exports.create = function create(req, res, next) {
  var body = req.body;

  if(req.user) {
    findByUsername(body.username, function(err, user) {
      if (err) return next(err);

      if(user != undefined) {
        res.json(409, {"error": "Username already exists"});
      } else {
        helpers.encode(body.password, function(err, derivedKey) {
          body.password = derivedKey;
          User.create(body, function(err) {
            if (err) next(err);
            else res.json(201, {ok: true});
          });
        });
      }
    });
  } else {
    res.json(403, {"error": "You do not have permission to create this resource"})
  }
};

exports.update = function update(req, res, next) {
  var body = req.body;

  findByUsername(req.params.user, function(err, user) {
    if (err) return next(err);

    if(user == undefined) {
      res.json(404, {"error": "Not found"});
    } else {
      helpers.encode(body.password, function(err, derivedKey) {
        body.password = derivedKey;
        user.updateAttributes(body, function(err) {
          if (err) next(err);
          else res.json(201, {ok: true});
        });
      });
    }
  });
};

exports.index = function index(req, res, next) {
  User.all(function(err, users) {
    if (err) return next(err);
    res.json(users);
  });
};

exports.show = function show(req, res, next) {
  findByUsername(req.params.user, function(err, user) {
    if (err) return next(err);

    if(user == undefined) {
      res.json(404, {"error": "Not found"});
    } else {
      res.json(user);
    }
  });
};

exports.destroy = function destroy(req, res, next) {
  findByUsername(req.params.user, function(err, user) {
    if (err) return next(err);

    if(user == undefined) {
      res.json(404, {"error": "Not found"});
    } else {
      user.destroy(function(err) {
        if (err) return next(err);
        res.send(204);
      });
    }
  });
};

exports.login = function login(req, res, next) {
  var token,
      body = req.body;

  findByUsername(body.username, function(err, user) {
    if(err) return next(err);
    if(!user) return res.send(403, new Error('Fail authenticate'));

    helpers.compare(body.password, user.password, function(err, matches) {
      if(err) return next(err);

      if(matches === true) {
        crypto.randomBytes(32, function(err, buffer) {
          if (err) return next(err);

          token = buffer.toString('hex');
          user.token = token;
          user.save(function(err) {
            if(err) return next(err);

            res.cookie('token', token);
            res.send({ok: true, token: token});
          });
        });
      } else {
        res.send(403, new Error('Fail authenticate'));
      }
    });
  });
};

exports.logout = function logout(req, res) {
  res.clearCookie('token');
  res.send({ok: true});
};