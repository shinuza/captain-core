var assert = require('assert');
var restify = require('restify');
var db = require('riak-js').getClient();

// Creates a JSON client
var client = restify.createJsonClient({
  url: 'http://localhost:8080'
});


before(function(done) {
  db.save('posts', 'some-title',
  {slug: 'some-title', title: 'Some title', created: new Date(), content: "Lorem ipsum"}, function(err) {
    assert.ifError(err);
    done();
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
    client.put('/posts/some-title',
    {title: 'Some edited title'}, function(err, req, res) {
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

  it('should be posibble to remove a post', function(done) {
    client.del('/posts/some-title', function(err, req, res) {
      assert.equal(res.statusCode, 200);
      done();
    });
  });
});