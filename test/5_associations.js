var assert = require('assert');
var restify = require('restify');
var Sequelize = require("sequelize");

var client = restify.createJsonClient({
  url: 'http://localhost:8080'
});

var models = require('../lib/models');

describe('Posts <-> user association:', function() {

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

describe('User <-> posts association:', function() {

  it('should possible to associate posts with a user', function(done) {
    client.get('/posts/?limit=5', function(err, req, res, posts) {
      client.post('/users/admin/posts', posts, function(err, req, res) {
        assert.equal(res.statusCode, 201);
        done();
      });
    });
  });

  it('should possible to get the associated posts of a user', function(done) {
    client.get('/users/admin/posts', function(err, req, res, json) {
      assert.equal(res.statusCode, 200);
      assert.equal(json.length, 5);
      done();
    });
  });

});

describe('Posts <-> tags association:', function() {

  it('should possible to associate posts with tags', function(done) {
    client.get('/posts/?limit=5', function(err, req, res, posts) {
      client.post('/tags/tag-1/posts', posts, function(err, req, res) {
        assert.equal(res.statusCode, 201);
        done();
      });
    });
  });

  it('should possible to get the associated posts of a tag', function(done) {
    client.get('/tags/tag-1/posts', function(err, req, res, json) {
      assert.equal(res.statusCode, 200);
      assert.equal(json.length, 5);
      done();
    });
  });

});