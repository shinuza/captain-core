var assert = require('assert');
var client = require('../client');
var models = require('../../lib/models');

describe('Resource:', function() {

    describe('Association:', function() {

      describe('posts -> tags:', function() {

        it('should get the associated posts to tag "Music" from its slug', function(done) {
          client.get('/tags/music/posts/', function(err, req, res, json) {
            assert.ifError(err);
            assert.equal(res.statusCode, 200);
            assert.equal(json.length, 2);
            done();
          });
        });

        it('should get the associated posts to tag "Music" from its id', function(done) {
          client.get('/tags/3/posts/', function(err, req, res, json) {
            assert.ifError(err);
            assert.equal(res.statusCode, 200);
            assert.equal(json.length, 2);
            done();
          });
        });

        it('should return 404 for an non-existent tag"', function(done) {
          client.get('/tags/drugs/posts/', function(err, req, res, json) {
            assert.equal(res.statusCode, 404);
            done();
          });
        });

        it('should get the associated tags to post "A blog post about HipHop" from its slug', function(done) {
          client.get('/posts/4/tags/', function(err, req, res, json) {
            assert.ifError(err);
            assert.equal(res.statusCode, 200);
            assert.equal(json.length, 2);
            done();
          });
        });

        it('should get the associated tags to post "A blog post about HipHop" from its id', function(done) {
          client.get('/posts/a-blog-post-about-hiphop/tags/', function(err, req, res, json) {
            assert.ifError(err);
            assert.equal(res.statusCode, 200);
            assert.equal(json.length, 2);
            done();
          });
        });

      });

    });

});