var assert = require('assert');

var client = require('../client');
var db = require('../../lib/db');


describe('Resource', function() {

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

    it('should count users', function(done) {
      client.get('/users/count', function(err, req, res, json) {
        assert.ifError(err);
        assert.equal(json.count, 2);
        done();
      });
    });

    it('should be possible to create users when logged in', function(done) {
      client.post('/users', {username: 'johndoe', password: 'foobar', email: 'john@doe.com'}, function(err, req, res, json) {
        assert.ifError(err);
        assert.equal(res.statusCode, 201);
        assert.notEqual(json.created_at, undefined);
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
      client.put('/users/5', {password: 'pass'}, function(err, req, res) {
        assert.ifError(err);
        assert.equal(res.statusCode, 201);
        done();
      });
    });

    it('should log in with a new password', function(done) {
      client.post('/sessions/', {username: 'johndoe', password: 'pass'}, function(err, req, res) {
        assert.equal(res.statusCode, 201);
        client.headers.cookie = res.headers['set-cookie'];
        done();
      });
    });

    it('should not be possible to modify a non-existent user', function(done) {
      client.put('/users/50', {first_name: 'babyyy'}, function(err, req, res, json) {
        assert.equal(res.statusCode, 404);
        assert.equal(json.message, 'Not found');
        done();
      });
    });

    it('should not be possible to view a non-existent user', function(done) {
      client.get('/users/willie', function(err, req, res, json) {
        assert.equal(res.statusCode, 404);
        assert.equal(json.message, 'Not found');
        done();
      });
    });

    it('should be possible to view all users', function(done) {
      client.get('/users', function(err, req, res, json) {
        assert.equal(res.statusCode, 200);
        assert.equal(json.users.length, 3);
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
      client.del('/users/5', function(err, req, res) {
        assert.equal(res.statusCode, 200);
        done();
      });
    });

    it('should log out', function(done) {
      client.del('/sessions/current', function(err, req, res) {
        assert.equal(res.statusCode, 200);
        done();
      });
    });

  });

});