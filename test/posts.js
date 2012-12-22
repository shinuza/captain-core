var assert = require('assert');
var restify = require('restify');

var client = restify.createJsonClient({
  url: 'http://localhost:8080'
});

var posts = require('../lib/posts');

function factory(items, cb) {
  var i, done = 0, tmpl;
  for(i = 0; i < items; i++) {
    tmpl = {};
    tmpl.created = new Date();
    tmpl.title = 'Some title ' + i;
    tmpl.content = 'Lorem ipsum ' + i;
    posts.Post.create(tmpl, function(err) {
      if(err) throw err;
      done++;
      if(done == items) cb();
    });
  }
}

before(function(done) {
  posts.Post.destroyAll(function(err) {
    if(err) throw err;
    factory(50, function() {
      client.post('/logout', {}, function(err) {
        if(err) throw err;
        done();
      });
    });
  });
});

describe('Posts:', function() {
  it('should be possible to create posts', function(done) {
    client.post('/posts',
    {title: 'Some other title', created: new Date(), content: "Lorem ipsum!!"}, function(err, req, res) {
      assert.ifError(err);
      assert.equal(res.statusCode, 201);
      done();
    });
  });

  it('should be possible to edit posts', function(done) {
    client.put('/posts/some-title-1', {title: 'Some edited title 1'}, function(err, req, res) {
      assert.equal(res.statusCode, 201);
      done();
    });
  });

  it('should be possible to view a single post', function(done) {
    client.get('/posts/some-title-1', function(err, req, res) {
      assert.equal(res.statusCode, 200);
      var body = JSON.parse(res.body);
      assert.equal(body.title, 'Some edited title 1');
      assert.equal(body.slug, 'some-title-1');
      assert.notEqual(body.modified, null);
      done();
    });
  });

  it('should be possible to view multiple posts at once', function(done) {
    client.get('/posts', function(err, req, res) {
      var body = JSON.parse(res.body);
      assert.equal(body.length, 51);
      done();
    });
  });

  it('should be possible to view only a subset of posts', function(done) {
    client.get('/posts?skip=5&limit=10', function(err, req, res) {
      var body = JSON.parse(res.body);
      assert.equal(body.length, 10);
      assert.equal(body[0].title, 'Some title 5');
      done();
    });
  });

  it('should be posible to remove a post', function(done) {
    client.del('/posts/some-title-1', function(err, req, res) {
      assert.equal(res.statusCode, 204);
      done();
    });
  });
});