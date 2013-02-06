var assert = require('assert');
var db = require('../../lib/db');

describe('Models', function() {

  describe('Users', function() {

    it('create', function(done) {
      db.users.create({username: 'shinuza', password: 'secret'}, function(err, user) {
        assert.ifError(err);
        assert.notEqual(user.id, undefined);
        done();
      });
    });

    it('create twice the same user should trigger an error', function(done) {
      db.users.create({username: 'shinuza', password: 'secret'}, function(err) {
        assert.notEqual(null, err);
        done();
      });
    });

    it('get by slug', function(done) {
      db.users.find('shinuza', function(err, user) {
        assert.ifError(err);
        assert.equal(user.username, 'shinuza');
        done();
      });
    });

    it('get by id', function(done) {
      db.users.find('1', function(err, user) {
        assert.ifError(err);
        assert.equal(user.username, 'admin');
        done();
      });
    });

    it('get by credentials', function(done) {
      db.users.findByCredentials('shinuza', 'secret', function(err, user) {
        assert.ifError(err);
        assert.equal(user.username, 'shinuza');
        done();
      });
    });

    it('update', function(done) {
      db.users.update(1, {'last_name': 'Gorse'}, function(err, user) {
        assert.ifError(err);
        assert.equal(user.last_name, 'Gorse');
        done();
      });
    });

    it('all', function(done) {
      db.users.all(function(err, users) {
        assert.ifError(err);
        assert.equal(users.length, 3);
        done();
      });
    });

    it('query', function(done) {
      db.users.query('SELECT COUNT(id) FROM users', function(err, r) {
        assert.ifError(err);
        assert.equal(r.rows[0].count, 3);
        done();
      });
    });

    it('del', function(done) {
      db.users.del(2, function(err, count) {
        assert.ifError(err);
        assert.ok(count == 1);
        done();
      });
    });

  });

});