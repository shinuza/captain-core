var assert = require('assert');
var restify = require('restify');
var Sequelize = require("sequelize");
var bogan = require('boganipsum');

var models = require('../lib/models');

var client = restify.createJsonClient({
  url: 'http://localhost:8080'
});

function factory(nb, cb) {
  var postChainer = new Sequelize.Utils.QueryChainer;
  for(var i = 0; i < nb; i++) {
    var p = models.Post.build({title: 'post ' + i, slug: "post-" + i, body: bogan(), published: i % 2 == 0});
    postChainer.add(p.save());
  }
  postChainer.run().success(cb).error(function(error) {throw error});
}

before(function(done) {
  factory(50, function() {done()});
});

describe('Posts:', function() {

  it('should not be possible to create posts when not logged it', function(done) {
    client.post('/posts',
      {title: 'Some other title', description: 'A description', body: "Lorem ipsum!!"}, function(err, req, res) {
        assert.equal(res.statusCode, 403);
        done();
      });
  });

  it('should not list unpublished posts when not logged it', function(done) {
    client.get('/posts', function(err, req, res, json) {
      assert.equal(res.statusCode, 200);
      assert.equal(json.length, 25);
      done();
    });
  });

  it('should log in', function(done) {
    client.post('/sessions/', {username: 'admin', password: 'admin'}, function(err, req, res) {
      assert.equal(res.statusCode, 201);
      client.headers.cookie = res.headers['set-cookie'];
      done();
    });
  });

  it('should be possible to list all posts when logged in', function(done) {
    client.get('/posts', function(err, req, res, json) {
      assert.equal(res.statusCode, 200);
      assert.equal(json.length, 50);
      done();
    });
  });

  it('should be possible to create posts when logged in', function(done) {
    client.post('/posts',
    {title: 'Some other title', description: 'A description', body: "Lorem ipsum!!"}, function(err, req, res, json) {
      assert.ifError(err);
      assert.equal(res.statusCode, 201);
      assert.notEqual(json.createdAt, undefined);
      assert.notEqual(json.id, undefined);
      done();
    });
  });

  it('should not be possible to create a post with an existing slug', function(done) {
    client.post('/posts',
      {title: 'post 49', description: 'A description', body: "Lorem ipsum!!"}, function(err, req, res) {
        assert.equal(res.statusCode, 409);
        done();
      });
  });

  it('should be possible to edit posts', function(done) {
    client.put('/posts/51', {title: 'Some edited title 1', published: true}, function(err, req, res) {
      assert.equal(res.statusCode, 201);
      done();
    });
  });

  it('should be possible to view a single post', function(done) {
    client.get('/posts/some-other-title', function(err, req, res, json) {
      client.get('/posts/51', function(err, req, res, json2) {
        assert.equal(res.statusCode, 200);
        assert.equal(json.title, json2.title);
        assert.equal(json.slug, json2.slug);
        done();
      });
    });
  });

  it('should not be possible to view a non-existing post', function(done) {
    client.get('/posts/i-dont-exist', function(err, req, res, json) {
      assert.equal(res.statusCode, 404);
      assert.equal(json.message, 'Not found');
      done();
    });
  });

  it('should be possible to view only a subset of posts', function(done) {
    client.get('/posts?offset=5&limit=10', function(err, req, res, json) {
      assert.equal(json.length, 10);
      assert.equal(json[0].title, 'post 45');
      done();
    });
  });

  it('should not be possible to remove a non-existing post', function(done) {
    client.del('/posts/999', function(err, req, res, json) {
      assert.equal(res.statusCode, 404);
      assert.equal(json.message, 'Not found');
      done();
    });
  });

  it('should be possible to remove a post', function(done) {
    client.del('/posts/49', function(err, req, res) {
      assert.equal(res.statusCode, 204);
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