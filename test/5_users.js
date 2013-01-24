var assert = require('assert');
var restify = require('restify');

var models = require('../lib/models');
var users = require('../lib/resources/users');

var client = restify.createJsonClient({
  url: 'http://localhost:8080'
});

describe('Users:', function() {

  it('should not be possible create users when not logged in', function(done) {
    client.post('/users', {username: 'johndoe', password: 'foobar'}, function(err, req, res) {
      assert.equal(res.statusCode, 403);
      done();
    });
  });

  it('should log in', function(done) {
    client.post('/sessions/', {username: 'admin', password: 'admin'}, function(err, req, res) {
      assert.equal(res.statusCode, 201);
      client.headers.cookie = res.headers['set-cookie'];
      done();
    });
  });

  it('should be possible to create users when logged in', function(done) {
    client.post('/users', {username: 'johndoe', password: 'foobar', email: 'john@doe.com'}, function(err, req, res, json) {
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
    client.get('/users/admin', function(err, req, res) {
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

  it('should log out', function(done) {
    client.del('/sessions/current', function(err, req, res) {
      assert.equal(res.statusCode, 204);
      done();
    });
  });

  it('should not allow creating a user after logout', function(done) {
    client.post('/users', {username: 'johndoe', password: 'foobar'}, function(err, req, res) {
      assert.equal(res.statusCode, 403);
      done();
    });
  });

});