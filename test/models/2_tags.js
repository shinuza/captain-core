var assert = require('assert');
var db = require('../../lib/db');

describe('Models', function() {

  describe('Tags', function() {

    it('create', function(done) {
      db.tags.create({title: 'Foo'}, function(err, tag) {
        assert.ifError(err);
        assert.notEqual(tag.id, undefined);
        done();
      });
    });

    it('create twice the same tag should trigger an error', function(done) {
      db.tags.create({title: 'Foo'}, function(err) {
        assert.notEqual(null, err);
        done();
      });
    });

    it('create a tag with incorrect parameters should trigger an error', function(done) {
      db.tags.create({}, function(err) {
        assert.notEqual(null, err);
        done();
      });
    });

    it('get by slug', function(done) {
      db.tags.find('foo', function(err, tag) {
        assert.ifError(err);
        assert.equal(tag.slug, 'foo');
        done();
      });
    });

    it('get by id', function(done) {
      db.tags.find('1', function(err, tag) {
        assert.ifError(err);
        assert.equal(tag.slug, 'programming');
        done();
      });
    });

    it('update', function(done) {
      db.tags.update(1, {'title': 'PROGRAMMING!'}, function(err, tag) {
        assert.ifError(err);
        assert.equal(tag.title, 'PROGRAMMING!');
        done();
      });
    });

    it('all', function(done) {
      db.tags.all(function(err, tags) {
        assert.ifError(err);
        assert.equal(tags.length, 3);
        done();
      });
    });

    it('del', function(done) {
      db.tags.del(4, function(err, count) {
        assert.ifError(err);
        assert.ok(count == 1);
        done();
      });
    });

  });

});