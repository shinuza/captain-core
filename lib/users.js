var crypto = require('crypto');
var bcrypt = require('bcrypt');
var db = require('riak-js').getClient();

var settings = require('../settings');
var BUCKET = 'users';

function _hmac(str) {
  var hmac = crypto.createHmac('sha1', settings.SECRET_KEY);
  hmac.update(str);
  return hmac.digest('base64');
}

var encode = exports.encode = function encode(password) {
  var hash = _hmac(password);
  var salt = bcrypt.genSaltSync();
  return bcrypt.hashSync(hash, salt);
};

var compare = exports.compare = function compare(clear, encrypted) {
  var hash = _hmac(clear);
  return bcrypt.compareSync(hash, encrypted);
};


exports.create = function create(req, res, next) {
  var body = req.body;
  body.password = encode(body.password);
  
  db.exists(BUCKET, body.username, function(err, exist) {
    if (err) { return next(err); }
    if(exist === true) {
      return res.json(409, {"error": "Username already exists"});
    }
    db.save(BUCKET, body.username, body, function(err) {
      if (err) { return next(err); }
      res.json(201, {ok: true});
    });
  });
};

exports.update = function update(req, res, next) {
  var body = req.body;
  body.password = encode(body.password);
  
  db.exists(BUCKET, req.params.user, function(err, exist) {
    if (err) { return next(err); }
    if(exist === false) {
      return res.json(404, {"error": "Not found"})
    }
    db.save(BUCKET, req.params.name, body, function(err) {
      if (err) { return next(err); }
      res.json(201, {ok: true});
    });
  });
};

exports.index = function index(req, res, next) {
  db.getAll(BUCKET, function(err, users, meta) {
    if (err) { return next(err); }
    res.json(users);
  });
};

exports.show = function show(req, res, next) {
  db.get(BUCKET, req.params.user, function(err, user) {
    if (err) { return next(err); }
    res.json(user);
  });
};

exports.destroy = function destroy(req, res, next) {
  db.remove(BUCKET, req.params.user, function(err) {
    if (err) { return next(err); }
    res.send(204);
  });
};

exports.login = function login(req, res, next) {
  var body = req.body;
  db.get(BUCKET, body.username, function(err, user) {
    if (err) {
      if(err.statusCode === 404) {
        return res.send(403, new Error('Fail authenticate'));
      } else {
        return next(err); 
      }
    }
    if(compare(body.password, user.password)) {
      res.send({ok: true});
    } else {
      res.send(403, new Error('Fail authenticate'));
    }
  });
};

exports.logout = function logout(req, res) {
  res.send({ok: true});
};