var crypto = require('crypto');
var bcrypt = require('bcrypt');
var restify = require('restify');
var db = require('riak-js').getClient();

var FLAG = 'users';
var SALT = '/muuO2DWoWdWcCuMK6jUb+yF6XvE3TajHncvUajqgQv/WYTQG3AbqjjQ';

function _hmac(str) {
  var hmac = crypto.createHmac('sha1', SALT);
  hmac.update(str);
  return hmac.digest('base64');
}

var encode = exports.encode = function encode(password) {
  var hash = _hmac(password);
  var salt = bcrypt.genSaltSync();
  return bcrypt.hashSync(hash, salt);
}

var compare = exports.compare = function compare(clear, encrypted) {
  var hash = _hmac(clear);
  return bcrypt.compareSync(hash, encrypted);
}


function PostUser(req, res, next) {
  var body = req.params;
  body.password = encode(body.password);
  //TODO: Add if exist
  db.save(FLAG, body.username, body, function(err) {
    if (err) { return next(err); }
    res.send(201, {ok: true});
    return next();
  });
}
PostUser.loginRequired = true;

function PutUser(req, res, next) {
  var body = req.params;
  body.password = encode(body.password);
  db.save(FLAG, req.params.name, body, function(err) {
    if (err) { return next(err); }
    res.send(201, {ok: true});
    return next();
  });
}

function GetUsers(req, res, next) {
  db.getAll(FLAG, function(err, users, meta) {
    if (err) { return next(err); }
    res.send(users);
    return next();
  });
}

function GetUser(req, res, next) {
  db.get(FLAG, req.params.name, function(err, user) {
    if (err) { return next(err); }
    res.send(user);
    return next();
  });
}


function DelUser(req, res, next) {
  db.remove(FLAG, req.params.name, function(err) {
    if (err) { return next(err); }
    res.send(204);
    return next();
  });
}

exports.attach = function attach(server) {
  // Refactor this
  function login(req, res, next) {
    db.get(FLAG, req.params.username, function(err, user) {
      if (err) { return next(err); }
      if(compare(req.params.password, user.password)) {
        server.username = req.params.username;
        res.send({ok: true});
        return next();
      } else {
        return next(new restify.NotAuthorizedError('Wrong username and password combination.'))
      }
    });
  }

  function logout(req, res) {
    server.username = null;
    res.send({ok: true});
  }

  server.post('/login', login);
  server.post('/logout', logout);

  server.post('/users', PostUser);
  server.get('/users', GetUsers);
  server.get('/users/:name', GetUser);
  server.del('/users/:name', DelUser);
  server.put('/users/:name', PutUser);

};