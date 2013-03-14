var assert = require('assert');
var client = require('../client');
var db = require('../../lib/db');

describe('Resource:', function() {

  describe('Sessions:', function() {

    it('should not allow to authenticate with wrong credentials', function(done) {
      client.post('/sessions/', {username: 'pinochio', password: 'foobar'}, function(err, req, res, json) {
        assert.equal(json.token, undefined);
        assert.equal(res.statusCode, 403);
        done();
      });
    });

    it('should allow to authenticate with correct credentials', function(done) {
      client.post('/sessions/', {username: 'admin', password: 'admin'}, function(err, req, res) {
        assert.ifError(err);
        assert.equal(res.statusCode, 201);
        client.headers.cookie = res.headers['set-cookie'];
        done();
      });
    });

    it('should return the associated user for a session', function(done) {
      client.get('/sessions/current', function(err, req, res, json) {
        assert.ifError(err);
        assert.equal(res.statusCode, 200);
        assert.equal(json.username, 'admin');
        done();
      });
    });

    it('should update the touch when a request is done while logged in', function(done) {
      var t = client.headers.cookie[0].split(';')[0].split('=')[1];
      db.tokens.findByToken(t, function(err, token) {
        assert.ifError(err);
        assert.ok(token.expires_at > new Date());
        done();
      });
    });

    it('should log out', function(done) {
      client.del('/sessions/current', function(err, req, res) {
        assert.equal(res.statusCode, 204);
        done();
      });
    });

    it('should return 404 when not authenticated', function(done) {
      client.get('/sessions/current', function(err, req, res) {
        assert.equal(res.statusCode, 404);
        done();
      });
    });

    it('should return a 404 when trying to log out again', function(done) {
      client.del('/sessions/current', function(err, req, res) {
        assert.equal(res.statusCode, 404);
        done();
      });
    });

  });

});