var assert = require('assert');
var models = require('../../lib/models');

describe('Models', function() {

  describe('Users', function() {

    it('create', function(done) {
      models.users.create({username: 'shinuza', password: 'secret'}, function(err, user) {
        assert.ifError(err);
        assert.notEqual(user.id, undefined);
        done();
      });
    });

    it('create twice the same user should trigger an error', function(done) {
      models.users.create({title: 'Foo'}, function(err) {
        assert.notEqual(null, err);
        done();
      });
    });

    it('get by slug', function(done) {
      models.users.find('shinuza', function(err, user) {
        assert.ifError(err);
        assert.equal(user.username, 'shinuza');
        done();
      });
    });

    it('get by id', function(done) {
      models.users.find('1', function(err, user) {
        assert.ifError(err);
        assert.equal(user.username, 'shinuza');
        done();
      });
    });

    it('update', function(done) {
      models.users.update(1, {'last_name': 'Gorse'}, function(err, user) {
        assert.ifError(err);
        assert.equal(user.last_name, 'Gorse');
        done();
      });
    });

    it('all', function(done) {
      models.users.all(function(err, users) {
        assert.ifError(err);
        assert.equal(users.length, 1);
        done();
      });
    });

    it('query', function(done) {
      models.users.query('SELECT COUNT(id) FROM users', function(err, r) {
        assert.ifError(err);
        assert.equal(r.rows[0].count, 1);
        done();
      });
    });

    it('del', function(done) {
      models.users.del(1, function(err, count) {
        assert.ifError(err);
        assert.ok(count == 1);
        done();
      });
    });

  });

});