var assert = require('assert');
var models = require('../../lib/db');

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
      models.posts.create(posts, function(err, tag) {
        assert.ifError(err);
        assert.notEqual(tag.id, undefined);
        done();
      });
    });

    it('create twice the same post should trigger an error', function(done) {
      models.posts.create(posts, function(err) {
        assert.notEqual(null, err);
        done();
      });
    });

    it('get by slug', function(done) {
      models.posts.find('foobar', function(err, post) {
        assert.ifError(err);
        assert.equal(post.slug, 'foobar');
        done();
      });
    });

    it('get by id', function(done) {
      models.posts.find('1', function(err, post) {
        assert.ifError(err);
        assert.equal(post.slug, 'a-blog-post-about-sql');
        done();
      });
    });

    it('update', function(done) {
      models.posts.update(1, {'title': 'FOO'}, function(err, post) {
        assert.ifError(err);
        assert.equal(post.title, 'FOO');
        assert.notEqual(post.updated_at, undefined);
        done();
      });
    });

    it('query', function(done) {
      models.posts.query('SELECT COUNT(id) FROM posts', function(err, r) {
        assert.ifError(err);
        assert.equal(r.rows[0].count, 7);
        done();
      });
    });

    it('count published', function(done) {
      models.posts.countPublished(function(err, count) {
        assert.ifError(err);
        assert.equal(count, 6);
        done();
      });
    });

    it('del', function(done) {
      models.posts.del(1, function(err, count) {
        assert.ifError(err);
        assert.ok(count == 1);
        done();
      });
    });

  });

});