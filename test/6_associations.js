var assert = require('assert');
var restify = require('restify');
var Sequelize = require("sequelize");

var models = require('../lib/models');

var client = restify.createJsonClient({
  url: 'http://localhost:8080'
});

describe('Posts user association:', function() {

  it('should log in', function(done) {
    client.post('/sessions/', {username: 'admin', password: 'admin'}, function(err, req, res) {
      assert.equal(res.statusCode, 201);
      client.headers.cookie = res.headers['set-cookie'];
      done();
    });
  });

  it('should associate a user with a post', function(done) {
    client.get('/users/admin', function(err, req, res, user) {
       assert.equal(res.statusCode, 200);
      client.post('/posts/post-1/user', user, function(err, req, res) {
        assert.equal(res.statusCode, 201);
        done();
      });
    });
  });

  it('should get the associated user of a post', function(done) {
    client.get('/posts/post-1/user', function(err, req, res, json) {
      assert.equal(res.statusCode, 200);
      assert.notEqual(json, null);
      done();
    });
  });

});

describe('User posts association:', function() {

  it('should associate posts with a user', function(done) {
    client.get('/posts/?limit=5', function(err, req, res, posts) {
      client.post('/users/admin/posts', posts, function(err, req, res) {
        assert.equal(res.statusCode, 201);
        done();
      });
    });
  });

  it('should get the associated posts of a user', function(done) {
    client.get('/users/admin/posts', function(err, req, res, json) {
      assert.equal(res.statusCode, 200);
      assert.equal(json.length, 5);
      done();
    });
  });

});

describe('Posts tags association:', function() {

  it('should associate posts with tags', function(done) {
    client.get('/posts/?limit=5&offset=5', function(err, req, res, posts) {
      client.post('/tags/1/posts', posts, function(err, req, res) {
        assert.equal(res.statusCode, 201);
        done();
      });
    });
  });

  it('should get the associated posts of a tag', function(done) {
    client.get('/tags/1/posts', function(err, req, res, json) {
      assert.equal(res.statusCode, 200);
      assert.equal(json.length, 5);
      done();
    });
  });

  it('should have created a post association to tag 1', function(done) {
    client.get('/posts/post-9/tags/', function(err, req, res, json) {
      assert.equal(res.statusCode, 200);
      assert.equal(json.length, 1);
      assert.equal(json[0].title, 'tag 0');
      done();
    });
  });

});
