var assert = require('assert');
var db = require('../../lib/db');

describe('Models', function() {

  describe('Tokens', function() {

    it('create', function(done) {
      db.tokens.create({token: 'foobar', user_id: 1}, function(err, token) {
        assert.ifError(err);
        assert.notEqual(token.id, undefined);
        done();
      });
    });

    it('create twice the same token should trigger an error', function(done) {
      db.tokens.create({token: 'foobar', user_id: 1}, function(err) {
        assert.notEqual(null, err);
        done();
      });
    });

    it('get by id', function(done) {
      db.tokens.findById(1, function(err, token) {
        assert.ifError(err);
        assert.equal(token.token, 'foobar');
        done();
      });
    });

    it('del', function(done) {
      db.tokens.del('foobar', function(err, count) {
        assert.ifError(err);
        assert.ok(count == 1);
        done();
      });
    });


  });

});