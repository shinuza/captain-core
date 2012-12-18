var crypto = require('crypto');
var bcrypt = require('bcrypt');
var db = require('riak-js').getClient();

var settings = require('../settings');
var USER_BUCKET = 'users';
var TOKEN_BUCKET = 'tokens';

function _hmac(str) {
  var hmac = crypto.createHmac('sha1', settings.SECRET_KEY);
  hmac.update(str);
  return hmac.digest('base64');
}

function encode(password) {
  var hash = _hmac(password);
  var salt = bcrypt.genSaltSync();
  return bcrypt.hashSync(hash, salt);
};
exports.encode = encode;

function compare(clear, encrypted) {
  var hash = _hmac(clear);
  return bcrypt.compareSync(hash, encrypted);
};
exports.compare = compare;

exports.create = function create(req, res, next) {
  var body = req.body;
  body.password = encode(body.password);
  
  if(req.user) {
    db.exists(USER_BUCKET, body.username, function(err, exist) {
      if (err) { return next(err); }
      if(exist === true) {
        return res.json(409, {"error": "Username already exists"});
      }
      db.save(USER_BUCKET, body.username, body, function(err) {
        if (err) { return next(err); }
        res.json(201, {ok: true});
      });
    });
  } else {
    res.json(403, {"error": "You do not have permission to create this resource"})
  }
};

exports.update = function update(req, res, next) {
  var body = req.body;
  body.password = encode(body.password);
  
  db.exists(USER_BUCKET, req.params.user, function(err, exist) {
    if (err) { return next(err); }
    if(exist === false) {
      return res.json(404, {"error": "Not found"})
    }
    db.save(USER_BUCKET, req.params.name, body, function(err) {
      if (err) { return next(err); }
      res.json(201, {ok: true});
    });
  });
};

exports.index = function index(req, res, next) {
  db.getAll(USER_BUCKET, function(err, users, meta) {
    if (err) { return next(err); }
    res.json(users);
  });
};

exports.show = function show(req, res, next) {
  db.get(USER_BUCKET, req.params.user, function(err, user) {
    if (err) { return next(err); }
    res.json(user);
  });
};

exports.destroy = function destroy(req, res, next) {
  db.remove(USER_BUCKET, req.params.user, function(err) {
    if (err) { return next(err); }
    res.send(204);
  });
};

db.on('riak.request.finish', function(x) {
  console.log(x.path)
})

exports.login = function login(req, res, next) {
  var body = req.body;

  db.get(USER_BUCKET, body.username, function(err, user) {
    if (err) {
      if(err.statusCode === 404) {
        return res.send(403, new Error('Fail authenticate'));
      } else {
        return next(err); 
      }
    }
    if(compare(body.password, user.password)) {
      crypto.randomBytes(32, function(err, buf) {
        if (err) { return next(err); }
        var token = buf.toString('hex');
        db.save(TOKEN_BUCKET, token, user, function(err) {
          console.log('ey', err)
          if(err) { return next(err); }
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