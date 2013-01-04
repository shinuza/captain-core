var assert = require('assert');
var restify = require('restify');
var Sequelize = require("sequelize");

var client = restify.createJsonClient({
  url: 'http://localhost:8080'
});

var models = require('../lib/models');

describe('Posts:', function() {

  it('should possible to associate a user with a post', function(done) {
    client.get('/users/admin', function(err, req, res, user) {
      client.post('/posts/post-1/user', user, function(err, req, res, json) {
        assert.equal(res.statusCode, 201);
        done();
      });
    });
  });

  it('should possible to get the associated user of a post', function(done) {
    client.get('/posts/post-1/user', function(err, req, res, json) {
      assert.equal(res.statusCode, 200);
      assert.notEqual(json, null);
      done();
    });
  });
});