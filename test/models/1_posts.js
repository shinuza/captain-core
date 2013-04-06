var assert = require('assert');
var db = require('../../lib/db');

var bogan = require('boganipsum');

describe('Models', function() {

  describe('Posts', function() {

    var posts = {
      title: 'Foobar',
      summary: 'Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Something something something dark side',
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
        assert.equal(post.slug, 'this-is-a-small-but-insightful-blog-post-about-sql');
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

    it('count', function(done) {
      db.posts.count(function(err, count) {
        assert.ifError(err);
        assert.equal(count, 7);
        done();
      });
    });

    it('all', function(done) {
      db.posts.all({page: 3, limit: 3}, function(err, obj) {
        assert.ifError(err);
        assert.equal(obj.page, 3);
        assert.equal(obj.rows.length, 1);
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

    it('all published', function(done) {
      db.posts.allPublished({page: 2, limit: 5}, function(err, obj) {
        assert.ifError(err);
        assert.equal(obj.page, 2);
        assert.equal(obj.rows.length, 1);
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