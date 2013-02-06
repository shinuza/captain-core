var assert = require('assert');
var models = require('../../lib/db');

describe('Models', function() {

  describe('Tokens', function() {

    it('create', function(done) {
      models.tokens.create({token: 'Blablabla', user_id: 1}, function(err, token) {
        assert.ifError(err);
        assert.notEqual(token.id, undefined);
        done();
      });
    });

    it('create twice the same token should trigger an error', function(done) {
      models.tokens.create({token: 'Blablabla', user_id: 1}, function(err) {
        assert.notEqual(null, err);
        done();
      });
    });

    it('get by id', function(done) {
      models.tokens.findById(1, function(err, token) {
        assert.ifError(err);
        assert.equal(token.token, 'Blablabla');
        done();
      });
    });

    it('update', function(done) {
      models.tokens.update(1, {'token': 'BOOM'}, function(err, token) {
        assert.ifError(err);
        assert.equal(token.token, 'BOOM');
        done();
      });
    });

    it('all', function(done) {
      models.tokens.all(function(err, tokens) {
        assert.ifError(err);
        assert.equal(tokens.length, 1);
        done();
      });
    });

    it('query', function(done) {
      models.tokens.query('SELECT COUNT(id) FROM tokens', function(err, r) {
        assert.ifError(err);
        assert.equal(r.rows[0].count, 1);
        done();
      });
    });

    it('del', function(done) {
      models.tokens.del('BOOM', function(err, count) {
        assert.ifError(err);
        assert.ok(count == 1);
        done();
      });
    });


  });

});