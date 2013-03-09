var assert = require('assert');
var client = require('../client');

describe('Resource:', function() {

  describe('Setup:', function() {

    it('should setup the database', function(done) {
      client.post('/setup/database/', {uri: 'tcp://shinuza@localhost/shinuza'}, function(err, req, res) {
        assert.ifError(err);
        assert.equal(res.statusCode, 201);
        done();
      });
    });

    it('should test the database connection', function(done) {
      client.get('/setup/connection-test', function(err, req, res) {
        assert.ifError(err);
        assert.equal(res.statusCode, 200);
        done();
      });
    });

    it.skip('should create the tables', function(done) {
      client.get('/setup/table-creation', function(err, req, res, json) {
        assert.ifError(err);
        assert.equal(res.statusCode, 200);
        assert.equal(json.length, 3);
        done();
      });
    });

    it.skip('should generate a site id', function(done) {
      client.get('/setup/generate-id', function(err, req, res, json) {
        assert.ifError(err);
        assert.equal(res.statusCode, 200);
        assert.equal(json.length, 3);
        done();
      });
    });

    it.skip('should generate a secret key', function(done) {
      client.get('/setup/generate-key', function(err, req, res, json) {
        assert.ifError(err);
        assert.equal(res.statusCode, 200);
        assert.equal(json.length, 3);
        done();
      });
    });

    it.skip('should create a user', function(done) {
      client.get('/setup/create-user', function(err, req, res, json) {
        assert.ifError(err);
        assert.equal(res.statusCode, 200);
        assert.equal(json.length, 3);
        done();
      });
    });

  });

});