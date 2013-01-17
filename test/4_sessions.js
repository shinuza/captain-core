var assert = require('assert');
var restify = require('restify');

var models = require('../lib/models');
var users = require('../lib/resources/users');

var client = restify.createJsonClient({
  url: 'http://localhost:8080'
});

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

  it('should be possible to logout', function(done) {
    client.del('/sessions/', function(err, req, res) {
      assert.equal(res.statusCode, 204);
      done();
    });
  });

});