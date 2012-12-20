var assert = require('assert');
var restify = require('restify');

// Creates a JSON client
var client = restify.createJsonClient({
  url: 'http://localhost:8080'
});

var posts = require('../lib/posts');

before(function(done) {
  posts.Post.destroyAll(function(err) {
    if(err) throw err;
    new posts.Post({title: 'Some title', created: new Date(), content: "Lorem ipsum"}).save(function(err) {
      if(err) throw err;
      client.post('/logout', {}, function(err) {
        if(err) throw err;
        done();
      });
    });
  });
});

describe('Posts:helpers', function() {
  it('should slugify the given string', function() {
    var result = posts.slugify("Un éléphant à l'orée du bois");
    assert.equal(result, 'un-elephant-a-loree-du-bois');
  });
});

describe('Posts:', function() {
  it('should be possible to create posts', function(done) {
    client.post('/posts',
    {title: 'Some title 2', created: new Date(), content: "Lorem ipsum 2"}, function(err, req, res) {
      assert.ifError(err);
      assert.equal(res.statusCode, 201);
      done();
    });
  });

  it('should be posibble to edit posts', function(done) {
    client.put('/posts/some-title', {title: 'Some edited title'}, function(err, req, res) {
      assert.equal(res.statusCode, 201);
      done();
    });
  });

  it('should be possible to view a single post', function(done) {
    client.get('/posts/some-title', function(err, req, res) {
      var body = JSON.parse(res.body);
      assert.equal(body.title, 'Some edited title');
      assert.notEqual(body.modified, null);
      done();
    });
  });

  it('should be possible to view multiple posts at once', function(done) {
    client.get('/posts', function(err, req, res) {
      var body = JSON.parse(res.body);
      assert.equal(body.length, 2);
      done();
    });
  });

  it('should be posible to remove a post', function(done) {
    client.del('/posts/some-title', function(err, req, res) {
      assert.equal(res.statusCode, 204);
      done();
    });
  });
});