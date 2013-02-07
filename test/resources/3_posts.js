var assert = require('assert');
var client = require('../client');
var db = require('../../lib/db');

describe('Resource', function() {

  describe('Posts', function() {

    it('should not be possible to create posts when not logged it', function(done) {
      client.post('/posts',
        {title: 'Something that fails', summary: 'A description', body: "Lorem ipsum!!", published: true}, function(err, req, res) {
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
      client.post('/posts', {title: 'Something that succeed', summary: "Something something", body: "Lorem ipsum!!", published: true},
        function(err, req, res, json) {
          assert.ifError(err);
          assert.equal(res.statusCode, 201);
          assert.notEqual(json.created_at, undefined);
          assert.notEqual(json.id, undefined);
          done();
        });
    });

    it('should not be possible to create a post with an existing slug', function(done) {
      client.post('/posts',
        {title: 'A blog post about Node.js', summary: 'A description bis', body: "Lorem ipsum!!"}, function(err, req, res) {
          assert.equal(res.statusCode, 409);
          done();
        });
    });

    it('should be possible to edit posts', function(done) {
      client.put('/posts/3', {title: 'Some edited title 1', published: true}, function(err, req, res, json) {
        assert.equal(res.statusCode, 201);
        assert.equal(json.title, 'Some edited title 1');
        done();
      });
    });

    it('should be possible to view a single post by id', function(done) {
      client.get('/posts/5', function(err, req, res, json) {
        assert.ifError(err);
        assert.equal(res.statusCode, 200);
        assert.equal(json.title, 'A blog post about Trance');
        assert.equal(json.slug, 'a-blog-post-about-trance');
        done();
      });
    });

    it('should be possible to view single post by slug', function(done) {
      client.get('/posts/a-blog-post-about-trance', function(err, req, res, json) {
        assert.ifError(err);
        assert.equal(res.statusCode, 200);
        assert.equal(json.title, 'A blog post about Trance');
        assert.equal(json.id, 5);
        done();
      });
    });

    it('should not be possible to edit a non-existent post', function(done) {
      client.put('/posts/50', {title: 'DO NOT EXIST'}, function(err, req, res, json) {
        assert.equal(res.statusCode, 404);
        assert.equal(json.message, 'Not found');
        done();
      });
    });

    it('should not be possible to view a non-existent post', function(done) {
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
          assert.equal(json[0].title, 'A blog post about Node.js');
          done();
        });
      });

      it('should be possible to posts by page', function(done) {
        client.get('/posts?page=1', function(err, req, res, json) {
        assert.equal(json.length, 5);
        assert.equal(json[4].title, 'A blog post about not publishing something');
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
      client.del('/posts/9', function(err, req, res) {
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

});