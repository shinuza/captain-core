var assert = require('assert');
var client = require('../client');
var models = require('../../lib/models');

function factory(nb, cb) {
  var bogan = require('boganipsum');
  var x = {
    username: 'admin',
      password: 'admin',
    imageUrl: '30.png',
    email: 'amin@acme.com',
    isStaff: true
  }
}


describe.skip('Posts', function() {

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
      assert.equal(json.length, 5);
      assert.equal(json[1].published, true);
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
      {title: 'post 49', description: 'A description bis', body: "Lorem ipsum!!"}, function(err, req, res) {
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

  describe('Pagination', function() {
    it('should be possible to view only a subset of posts', function(done) {
      client.get('/posts', function(err, req, res, json) {
        assert.equal(json.length, 5);
        assert.equal(json[0].title, 'Some edited title 1');
        done();
      });
    });

    it('should be possible to posts by page', function(done) {
      client.get('/posts?page=5', function(err, req, res, json) {
      assert.equal(json.length, 5);
      assert.equal(json[4].title, 'post 0');
      done();
    });
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