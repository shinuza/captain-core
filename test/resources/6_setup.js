var fs = require('fs');
var path = require('path');

var assert = require('assert');
var restify = require('restify');

var client = require('../client');
var settings = require('../../lib/conf.js');

describe('Resource:', function() {

  describe('Setup:', function() {

    it('should the database connection', function(done) {
      client.post('/setup/connection-test/', {uri: 'tcp://shinuza@localhost/shinuza'}, function(err, req, res) {
        assert.ifError(err);
        assert.equal(res.statusCode, 200);
        done();
      });
    });

    it('should create a user', function(done) {
      client.post('/setup/user-creation', {username: 'foo', password: 'bar'}, function(err, req, res, json) {
        assert.ifError(err);
        assert.equal(res.statusCode, 201);
        done();
      });
    });

    it('should generate the settings-file', function(done) {
      client.post('/setup/commit', function(err, req, res) {
        assert.ifError(err);
        assert.equal(res.statusCode, 201);
        assert.equal(fs.existsSync(path.join(process.cwd(), settings.DEFAULT_FILENAME)), true);
        assert
        done();
      });
    });

    it('should create the tables', function(done) {
      var client = restify.createStringClient({
        url: 'http://localhost:' + settings.get('PORT')
      });
      client.get('/setup/table-creation', function(err, req, res) {
        assert.ifError(err);
        assert.equal(res.headers['content-type'], "text/event-stream; charset=utf-8");
        client.close();
        done();
      });
    });


  });

});