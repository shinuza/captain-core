var restify = require('restify');
var db = require('riak-js').getClient();

var FLAG = 'users';

module.exports = function(server) {
  server.post('/users', function(req, res, next) {
    var body = req.params;
    db.save(FLAG, body.name, body, function(err) {
      if (err) { return next(err); }
      res.send(201, {ok: true});
      return next();
    });
  });
  
  server.get('/users', function(req, res, next) {
    db.getAll(FLAG, function(err, users, meta) {
      if (err) { return next(err); }
      res.send(users);
      return next();
    });
  });
  
  server.get('/users/:name', function(req, res, next) {
    db.get(FLAG, req.params.name, function(err, user) {
      if (err) { return next(err); }
      res.send(user);
      return next();
    });
  });
  
  
  server.del('/users/:name', function(req, res, next) {
    db.remove(FLAG, req.params.name, function(err) {
      if (err) { return next(err); }
      res.send(204);
      return next();
    });
  });
  
  server.put('/users/:name', function(req, res, next) {
    var body = req.params;
    db.save(FLAG, req.params.name, body, function(err) {
      if (err) { return next(err); }
      res.send(201, {ok: true});
      return next();
    });
  });
};