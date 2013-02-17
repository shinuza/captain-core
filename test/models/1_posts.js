var assert = require('assert');
var db = require('../../lib/db');

var bogan = require('boganipsum');

describe('Models', function() {

  describe('Posts', function() {

    var posts = {
      title: 'Foobar',
      summary: 'Integer posuere erat a ante venenatis dapibus posuere velit aliquet.',
      body: bogan(),
      published: true,
      user_id: 1
    };

    it('create', function(done) {
      db.posts.create(posts, function(err, post) {
        assert.ifError(err);
        assert.notEqual(post.id, undefined);
        done();
      });
    });

    it('create twice the same post should trigger an error', function(done) {
      db.posts.create(posts, function(err) {
        assert.notEqual(null, err);
        done();
      });
    });

    it('create a post with incorrect parameters should trigger an error', function(done) {
      db.posts.create({}, function(err) {
        assert.notEqual(null, err);
        done();
      });
    });

    it('get by slug', function(done) {
      db.posts.find('foobar', function(err, post) {
        assert.ifError(err);
        assert.equal(post.slug, 'foobar');
        done();
      });
    });

    it('get by id', function(done) {
      db.posts.find('1', function(err, post) {
        assert.ifError(err);
        assert.equal(post.slug, 'a-blog-post-about-sql');
        done();
      });
    });

    it('update', function(done) {
      db.posts.update(1, {'title': 'FOO'}, function(err, post) {
        assert.ifError(err);
        assert.equal(post.title, 'FOO');
        assert.notEqual(post.updated_at, undefined);
        done();
      });
    });

    it('count published', function(done) {
      db.posts.countPublished(function(err, count) {
        assert.ifError(err);
        assert.equal(count, 6);
        done();
      });
    });

    it('del', function(done) {
      db.posts.del(1, function(err, count) {
        assert.ifError(err);
        assert.ok(count == 1);
        done();
      });
    });

  });

});