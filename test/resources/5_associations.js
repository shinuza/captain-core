"use strict";

var assert = require('assert')
  , client = require('../client');


describe('Resource:', function() {

  describe('Association:', function() {

    describe('posts -> tags:', function() {

      it('should get the associated posts to tag "General" from its slug', function(done) {
        client.get('/tags/general/', function(err, req, res, json) {
          assert.ifError(err);
          assert.equal(res.statusCode, 200);
          assert.equal(json.length, 3);
          done();
        });
      });

      it('should get the associated posts to tag "General" from its id', function(done) {
        client.get('/tags/2/', function(err, req, res, json) {
          assert.ifError(err);
          assert.equal(res.statusCode, 200);
          assert.equal(json.length, 3);
          done();
        });
      });

      it('should return 404 for an non-existent tag"', function(done) {
        client.get('/tags/drugs/', function(err, req, res) {
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

      it('should log in', function(done) {
        client.post('/sessions/', {username: 'admin', password: 'admin'}, function(err, req, res) {
          assert.equal(res.statusCode, 201);
          client.headers.cookie = res.headers['set-cookie'];
          done();
        });
      });

      it('should associate posts "A blog post about not publishing something" to tags "Programing" And "Music"', function(done) {
        client.post('/posts/6/tags/', [{id: 1}, {id: 3}], function(err, req, res, json) {
          assert.ifError(err);
          assert.equal(res.statusCode, 201);
          assert.equal(json.count, 2);

          client.get('/posts/6/tags/', function(err, req, res, json) {
            assert.ifError(err);
            assert.equal(res.statusCode, 200);
            assert.equal(json.length, 2);
            done();
          });
        });
      });

    });

  });

});