"use strict";

var assert = require('assert')
  , db = require('../../lib/db');


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

    it('count', function(done) {
      db.tags.count(function(err, count) {
        assert.ifError(err);
        assert.equal(count, 4);
        done();
      });
    });

    it('all', function(done) {
      db.tags.all({page: 4, limit: 1}, function(err, obj) {
        assert.ifError(err);
        assert.equal(obj.page, 4);
        assert.equal(obj.rows.length, 1);
        done();
      });
    });

    it('count with posts', function(done) {
      db.tags.countWithPosts(function(err, count) {
        assert.ifError(err);
        assert.equal(count, 3);
        done();
      });
    });

    it('all with posts', function(done) {
      db.tags.allWithPosts({page: 2, limit: 2}, function(err, obj) {
        assert.ifError(err);
        assert.equal(obj.page, 2);
        assert.equal(obj.rows.length, 1);
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