var assert = require('assert');

var client = require('./client');
var models = require('../lib/models');

describe('Sessions:', function() {

  it('allow to authenticate with wrong credentials', function(done) {
    client.post('/sessions/', {username: 'pinochio', password: 'foobar'}, function(err, req, res, json) {
      assert.equal(json.token, undefined);
      assert.equal(res.statusCode, 403);
      done();
    });
  });

  it('allow to authenticate with correct credentials', function(done) {
    client.post('/sessions/', {username: 'admin', password: 'admin'}, function(err, req, res) {
      assert.ifError(err);
      assert.equal(res.statusCode, 201);
      client.headers.cookie = res.headers['set-cookie'];
      done();
    });
  });

  it('should be return the associated user for a session', function(done) {
    client.get('/sessions/current', function(err, req, res, json) {
      assert.ifError(err);
      assert.equal(res.statusCode, 200);
      assert.equal(json.username, 'admin');
      done();
    });
  });

  it('should log out', function(done) {
    client.del('/sessions/current', function(err, req, res) {
      assert.equal(res.statusCode, 204);
      done();
    });
  });

});