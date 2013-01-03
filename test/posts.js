var assert = require('assert');
var restify = require('restify');
var Sequelize = require("sequelize");

var client = restify.createJsonClient({
  url: 'http://localhost:8080'
});

var models = require('../lib/models');

function factory(nb, cb) {
  var postChainer = new Sequelize.Utils.QueryChainer;
  for(var i = 0; i < nb; i++) {
    var p = models.Post.build({title: 'post ' + i, slug: "post-" + i, description: 'Long text somehow', body: 'Cool'});
    postChainer.add(p.save());
  }
  postChainer.run().success(cb).error(function(error) {throw error});
}

before(function(done) {
  factory(50, function() {
    client.post('/logout', {}, function(err) {
      if(err) throw err;
      done();
    });
  });
});

describe('Posts:', function() {

  it('should not be possible to create a post with an existing slug', function(done) {
    client.post('/posts',
      {title: 'post 49', description: 'A description', body: "Lorem ipsum!!"}, function(err, req, res) {
        assert.equal(res.statusCode, 409);
        done();
      });
  });

  it('should be possible to create posts', function(done) {
    client.post('/posts',
    {title: 'Some other title', description: 'A description', body: "Lorem ipsum!!"}, function(err, req, res) {
      assert.ifError(err);
      assert.equal(res.statusCode, 201);
      done();
    });
  });

  it('should be possible to edit posts', function(done) {
    client.put('/posts/some-other-title', {title: 'Some edited title 1'}, function(err, req, res) {
      assert.equal(res.statusCode, 201);
      done();
    });
  });

  it('should be possible to view a single post', function(done) {
    client.get('/posts/some-other-title', function(err, req, res) {
      var body = JSON.parse(res.body);

      assert.equal(res.statusCode, 200);
      assert.equal(body.title, 'Some edited title 1');
      assert.equal(body.slug, 'some-other-title');
      done();
    });
  });

  it('should be possible to view a non-existing post', function(done) {
    client.get('/posts/i-dont-exist', function(err, req, res) {
      var body = JSON.parse(res.body);

      assert.equal(res.statusCode, 404);
      assert.equal(body.error, 'Not found');
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
    client.get('/posts?offset=5&limit=10', function(err, req, res) {
      var body = JSON.parse(res.body);

      assert.equal(body.length, 10);
      assert.equal(body[0].title, 'post 5');
      done();
    });
  });

  it('should be possible to remove a non-existing post', function(done) {
    client.del('/posts/i-dont-exist', function(err, req, res) {
      var body = JSON.parse(res.body);

      assert.equal(res.statusCode, 404);
      assert.equal(body.error, 'Not found');
      done();
    });
  });

  it('should be posible to remove a post', function(done) {
    client.del('/posts/post-49', function(err, req, res) {
      assert.equal(res.statusCode, 204);
      done();
    });
  });
});