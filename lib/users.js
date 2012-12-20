var crypto = require('crypto');
var bcrypt = require('bcrypt');
var settings = require('../settings');

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
function _hmac(str) {
  var hmac = crypto.createHmac('sha1', settings.SECRET_KEY);
  hmac.update(str);
  return hmac.digest('base64');
}

function encode(password) {
  var hash = _hmac(password);
  var salt = bcrypt.genSaltSync();
  return bcrypt.hashSync(hash, salt);
}
exports.encode = encode;

function compare(clear, encrypted) {
  var hash = _hmac(clear);
  return bcrypt.compareSync(hash, encrypted);
}
exports.compare = compare;

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
  body.password = encode(body.password);

  if(req.user) {
    findByUsername(body.username, function(err, user) {
      if (err) return next(err);

      if(user != undefined) {
        res.json(409, {"error": "Username already exists"});
      } else {
        new User(body).save(function(err) {
          if (err) return next(err);
          res.json(201, {ok: true});
        });
      }
    });
  } else {
    res.json(403, {"error": "You do not have permission to create this resource"})
  }
};

exports.update = function update(req, res, next) {
  var body = req.body;
  body.password = encode(body.password);

  findByUsername(req.params.user, function(err, user) {
    if (err) return next(err);

    if(user == undefined) {
      res.json(404, {"error": "Not found"});
    } else {
      new User(body).save(function(err) {
        if (err) { return next(err); }
        res.json(201, {ok: true});
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

    if(compare(body.password, user.password)) {
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
};

exports.logout = function logout(req, res) {
  res.clearCookie('token');
  res.send({ok: true});
};