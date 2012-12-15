var restify = require('restify');
var db = require('riak-js').getClient();

var decorators = require('./decorators');

var FLAG = 'users';


function PostUsers(req, res, next) {
  var body = req.params;
  db.save(FLAG, body.name, body, function(err) {
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
GetUsers.loginRequired = true;

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

function PutUser(req, res, next) {
  var body = req.params;
  db.save(FLAG, req.params.name, body, function(err) {
    if (err) { return next(err); }
    res.send(201, {ok: true});
    return next();
  });
}


module.exports = function(server) {
  server.post('/users', PostUsers);
  server.get('/users', GetUsers);
  server.get('/users/:name', GetUser);
  server.del('/users/:name', DelUser);
  server.put('/users/:name', PutUser);

};