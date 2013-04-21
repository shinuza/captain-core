"use strict";

var assert = require('assert')
  , client = require('../client')
  , db = require('../../lib/db');


describe('Resource', function() {

  describe('Tags', function() {

    it('should not be possible to create tags when not logged it', function(done) {
      client.post('/tags',
        {title: 'Some other title'}, function(err, req, res) {
          assert.equal(res.statusCode, 403);
          done();
        });
    });

    it('should log in', function(done) {
      client.post('/sessions/', {username: 'admin', password: 'admin'}, function(err, req, res) {
        assert.ifError(err);
        assert.equal(res.statusCode, 201);
        client.headers.cookie = res.headers['set-cookie'];
        done();
      });
    });

    it('should return the number of tags in the database', function(done) {
      client.get('/tags/count', function(err, req, res, json) {
        assert.ifError(err);
        assert.equal(json.count, 3);
        done();
      });
    });

    it('should be possible to create tags when logged it', function(done) {
      client.post('/tags', {title: 'Some other title'}, function(err, req, res, json) {
        assert.ifError(err);
        assert.equal(res.statusCode, 201);
        assert.notEqual(json.id, undefined);
        done();
      });
    });

    it('ignore creating a tag with an existing slug', function(done) {
      client.post('/tags', {title: 'General'}, function(err, req, res) {
        assert.equal(res.statusCode, 201);
        done();
      });
    });

    it('retrieve all tags', function(done) {
      client.get('/tags', function(err, req, res, json) {
        assert.ifError(err);
        assert.equal(res.statusCode, 200);
        assert.equal(json.tags.length, 3);
        done();
      });
    });

    it('should be possible to edit tags', function(done) {
      client.put('/tags/6', {title: 'FOOBAR'}, function(err, req, res, json) {
        assert.equal(res.statusCode, 201);
        assert.notEqual(json, undefined);
        done();
      });
    });

    it('should be possible to view a single tag', function(done) {
      client.get('/tags/6', function(err, req, res, json) {
        assert.equal(res.statusCode, 200);
        assert.equal(json.title, 'FOOBAR');
        assert.equal(json.slug, 'some-other-title');
        done();
      });
    });

    it('should not be possible to view a non-existing tag', function(done) {
      client.get('/tags/i-dont-exist', function(err, req, res, json) {
        assert.equal(res.statusCode, 404);
        assert.equal(json.message, 'Not found');
        done();
      });
    });

    it('should not be possible to remove a non-existing tag', function(done) {
      client.del('/tags/50', function(err, req, res, json) {
        assert.equal(res.statusCode, 404);
        assert.equal(json.message, 'Not found');
        done();
      });
    });

    it('should be possible to remove a tag', function(done) {
      client.del('/tags/6', function(err, req, res) {
        assert.equal(res.statusCode, 200);
        done();
      });
    });

    it('should log out', function(done) {
      client.del('/sessions/current', function(err, req, res) {
        assert.equal(res.statusCode, 200);
        done();
      });
    });

  });

});