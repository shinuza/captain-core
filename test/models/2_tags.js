var assert = require('assert');
var models = require('../../lib/models');

describe('Models', function() {

  describe('Tags', function() {

    it('create', function(done) {
      models.tags.create({title: 'Foo'}, function(err, tag) {
        assert.ifError(err);
        assert.notEqual(tag.id, undefined);
        done();
      });
    });

    it('create twice the same tag should trigger an error', function(done) {
      models.tags.create({title: 'Foo'}, function(err) {
        assert.notEqual(null, err);
        done();
      });
    });

    it('get by slug', function(done) {
      models.tags.find('foo', function(err, tag) {
        assert.ifError(err);
        assert.equal(tag.slug, 'foo');
        done();
      });
    });

    it('get by id', function(done) {
      models.tags.find('1', function(err, tag) {
        assert.ifError(err);
        assert.equal(tag.slug, 'foo');
        done();
      });
    });

    it('update', function(done) {
      models.tags.update(1, {'title': 'FOO'}, function(err, tag) {
        assert.ifError(err);
        assert.equal(tag.title, 'FOO');
        done();
      });
    });

    it('all', function(done) {
      models.tags.all(function(err, tags) {
        assert.ifError(err);
        assert.equal(tags.length, 1);
        done();
      });
    });

    it('query', function(done) {
      models.tags.query('SELECT COUNT(id) FROM tags', function(err, r) {
        assert.ifError(err);
        assert.equal(r.rows[0].count, 1);
        done();
      });
    });

    it('del', function(done) {
      models.tags.del(1, function(err, count) {
        assert.ifError(err);
        assert.ok(count == 1);
        done();
      });
    });

  });

});