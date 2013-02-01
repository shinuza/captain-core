var assert = require('assert');

var client = require('./client');
var models = require('../lib/models');

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
      client.post('/posts/0/user', user, function(err, req, res) {
        assert.equal(res.statusCode, 201);
        done();
      });
    });
  });

  it('should get the associated user of a post', function(done) {
    client.get('/posts/0/user', function(err, req, res, json) {
      assert.equal(res.statusCode, 200);
      assert.equal(json.username, 'admin');
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
      assert.equal(json.length, 50);
      done();
    });
  });

});

describe('Posts tags association:', function() {

  it('should associate post 1 to tag 1', function(done) {
    client.post('/posts/0/tags/', {data: [{id: 1}, {id: 2}]}, function(err, req, res) {
      assert.equal(res.statusCode, 201);
      client.get('/tags/tag-1/posts', function(err, req, res, json) {
        assert.equal(res.statusCode, 200);
        assert.equal(json.length, 1);
        done();
      });
    });
  });

  it('should retrieve associated tags to post 1', function(done) {
    client.get('/posts/0/tags/', function(err, req, res, json) {
      assert.equal(res.statusCode, 200);
      assert.equal(json.length, 2);
      assert.equal(json[0].title, 'tag 0');
      done();
    });
  });

});
