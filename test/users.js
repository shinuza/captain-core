var assert = require('assert');
var restify = require('restify');
var db = require('riak-js').getClient();

var encode = require('../lib/users').encode;

// Creates a JSON client
var client = restify.createJsonClient({
  url: 'http://localhost:8080'
});

before(function(done) {
  db.save('users', 'admin', {username: 'admin', password: encode('admin')}, function(err) {
    if(err) throw err;
    client.post('/logout', {}, function(err) {
      if(err) throw err;
      done();
    });
  });
});

describe('Users:', function() {
  it('should not be able to log with wrong credentials', function(done) {
    client.post('/login', {username: 'pinochio', password: 'foobar'}, function(err, req, res, data) {
      assert.equal(data.token, undefined);
      assert.equal(res.statusCode, 403);
      done();
    });
  });

  it('should be able to log with correct credentials', function(done) {
    client.post('/login', {username: 'admin', password: 'admin'}, function(err, req, res, data) {
      assert.notEqual(data.token, undefined);
      assert.equal(res.statusCode, 200);
      client.headers.cookie = 'token=' + data.token + ';';
      done();
    });
  });

  it('should be able to create users', function(done) {
    client.post('/users', {username: 'johndoe', password: 'foobar'}, function(err, req, res) {
      assert.equal(res.statusCode, 201);
      done();
    });
  });
  
  it('should not be possible to create two users with the same uername', function(done) {
    client.post('/users', {username: 'johndoe', password: 'foobar'}, function(err, req, res) {
      assert.equal(res.statusCode, 409);
      done();
    });
  });
  
  it('should not be possible to modify a non-existent user', function(done) {
    client.put('/users/willie', {password: 'neely'}, function(err, req, res) {
      assert.equal(res.statusCode, 404);
      done();
    });
  });
  
  it('should not be possible to remove a non-existent user', function(done) {
    client.del('/users/willie', function(err, req, res) {
      assert.equal(res.statusCode, 404);
      done();
    });
  });
  
  it('should not be possible to view a non-existent user', function(done) {
    client.get('/users/willie', function(err, req, res) {
      assert.equal(res.statusCode, 404);
      done();
    });
  });
});