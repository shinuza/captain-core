var assert = require('assert');
var restify = require('restify');

var models = require('../lib/models');
var users = require('../lib/resources/users');

var client = restify.createJsonClient({
  url: 'http://localhost:8080'
});

before(function(done) {
  users.createUser({username: 'admin', password: 'admin', imageUrl: '30.png'}, function() {
    client.del('/users/session', function(err) {
      if(err) throw err;
      done();
    });
  });
});

describe('Users:', function() {

  it('allow to authenticate with wrong credentials', function(done) {
    client.post('/users/session', {username: 'pinochio', password: 'foobar'}, function(err, req, res, json) {
      assert.equal(json.token, undefined);
      assert.equal(res.statusCode, 403);
      done();
    });
  });

  it('does not allow to create users when not logged in', function(done) {
    client.post('/users', {username: 'johndoe', password: 'foobar'}, function(err, req, res) {
      assert.equal(res.statusCode, 403);
      done();
    });
  });

  it('allow to authenticate with correct credentials', function(done) {
    client.post('/users/session', {username: 'admin', password: 'admin'}, function(err, req, res, json) {
      assert.ifError(err);
      assert.equal(res.statusCode, 200);
      client.headers.cookie = res.headers['set-cookie'];
      done();
    });
  });

  it('allow to create users when logged in', function(done) {
    client.post('/users', {username: 'johndoe', password: 'foobar'}, function(err, req, res, json) {
      assert.ifError(err);
      assert.equal(res.statusCode, 201);
      assert.notEqual(json.createdAt, undefined);
      assert.notEqual(json.id, undefined);
      done();
    });
  });

  it('should not be possible to create two users with the same username', function(done) {
    client.post('/users', {username: 'johndoe', password: 'foobar'}, function(err, req, res) {
      assert.equal(res.statusCode, 409);
      done();
    });
  });

  it('should be possible to modify a user', function(done) {
    client.put('/users/2', {password: 'hellooooo'}, function(err, req, res) {
      assert.equal(res.statusCode, 201);
      done();
    });
  });

  it('should not be possible to modify a non-existent user', function(done) {
    client.put('/users/50', {firstname: 'babyyy'}, function(err, req, res) {
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

  it('should be possible to view a user', function(done) {
    client.get('/users/johndoe', function(err, req, res) {
      assert.equal(res.statusCode, 200);
      done();
    });
  });

  it('should not be possible to remove a non-existent user', function(done) {
    client.del('/users/50', function(err, req, res) {
      assert.equal(res.statusCode, 404);
      done();
    });
  });

  it('should be possible to remove a user', function(done) {
    client.del('/users/2', function(err, req, res) {
      assert.equal(res.statusCode, 204);
      done();
    });
  });

});