var restify = require('restify');
var db = require('riak-js').getClient();

var decorators = require('./decorators');

var FLAG = 'users';

module.exports = function(server) {

  function PostUsers(req, res, next) {
    var body = req.params;
    db.save(FLAG, body.name, body, function(err) {
      if (err) { return next(err); }
      res.send(201, {ok: true});
      return next();
    });
  }
  server.post('/users', PostUsers);


  function GetUsers(req, res, next) {
    db.getAll(FLAG, function(err, users, meta) {
      if (err) { return next(err); }
      res.send(users);
      return next();
    });
  }
  GetUsers.loginRequired = true;
  server.get('/users', GetUsers);


  function GetUser(req, res, next) {
      db.get(FLAG, req.params.name, function(err, user) {
        if (err) { return next(err); }
        res.send(user);
        return next();
      });
    }
  server.get('/users/:name', GetUser);


  function DelUser(req, res, next) {
      db.remove(FLAG, req.params.name, function(err) {
        if (err) { return next(err); }
        res.send(204);
        return next();
      });
    }
  server.del('/users/:name', DelUser);


  function PutUser(req, res, next) {
      var body = req.params;
      db.save(FLAG, req.params.name, body, function(err) {
        if (err) { return next(err); }
        res.send(201, {ok: true});
        return next();
      });
    }
  server.put('/users/:name', PutUser);

};