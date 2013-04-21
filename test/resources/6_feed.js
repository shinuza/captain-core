"use strict";

var assert = require('assert')
  , client = require('../client')
  , fs = require('fs')
  , path =  require('path');


describe('Resource', function() {

  describe('Feed:', function() {

    it('display', function(done) {
      client.get('/feed', function(err, req, res) {
        assert.equal(res.statusCode, 200);
        assert.equal(fs.existsSync(path.resolve(__dirname, '..', '..', 'cache', 'feed.xml')), true);
        done();
      });
    });

  });

});