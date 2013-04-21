"use strict";

var assert = require('assert')
  , db = require('../../lib/db');


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

    it('create a user with incorrect parameters should trigger an error', function(done) {
      db.users.create({}, function(err) {
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

    it('count', function(done) {
      db.users.count(function(err, count) {
        assert.ifError(err);
        assert.equal(count, 3);
        done();
      });
    });

    it('all', function(done) {
      db.users.all({page: 2, limit: 2}, function(err, obj) {
        assert.ifError(err);
        assert.equal(obj.page, 2);
        assert.equal(obj.rows.length, 1);
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