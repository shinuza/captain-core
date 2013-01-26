var assert = require('assert');
var restify = require('restify');
var Sequelize = require("sequelize");

var models = require('../lib/models');

var client = restify.createJsonClient({
  url: 'http://localhost:8080'
});

function factory(nb, cb) {
  var tagChainer = new Sequelize.Utils.QueryChainer;
  for(var i = 0; i < nb; i++) {
    var p = models.Tag.build({title: 'tag ' + i, slug: "tag-" + i});
    tagChainer.add(p.save());
  }
  tagChainer.run().success(cb).error(function(error) {throw error});
}

before(function(done) {
  factory(10, function() {done()});
});

describe('Tags:', function() {

  it('should be possible to create tags when not logged it', function(done) {
    client.post('/tags',
      {title: 'Some other title'}, function(err, req, res) {
        assert.equal(res.statusCode, 403);
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

  it('should be possible to create tags when logged it', function(done) {
    client.post('/tags',
      {title: 'Some other title'}, function(err, req, res, json) {
        assert.ifError(err);
        assert.equal(res.statusCode, 201);
        assert.notEqual(json.createdAt, undefined);
        assert.notEqual(json.id, undefined);
        done();
      });
  });

  it('ignore creating a tag with an existing slug', function(done) {
    client.post('/tags',
      {title: 'tag 5'}, function(err, req, res) {
        assert.equal(res.statusCode, 200);
        done();
      });
  });

  it('should be possible to edit tags', function(done) {
    client.put('/tags/11', {title: 'Some edited title 1'}, function(err, req, res) {
      assert.equal(res.statusCode, 201);
      done();
    });
  });

  it('should be possible to view a single tag', function(done) {
    client.get('/tags/some-other-title', function(err, req, res, json) {
      assert.equal(res.statusCode, 200);
      assert.equal(json.title, 'Some edited title 1');
      assert.equal(json.slug, 'some-other-title');
      done();
    });
  });

  it('should not be possible to view a non-existing tag', function(done) {
    client.get('/tags/i-dont-exist', function(err, req, res, json) {
      assert.equal(res.statusCode, 404);
      assert.equal(json.message, 'Not found');
      done();
    });
  });

  it('should be possible to view multiple tags at once', function(done) {
    client.get('/tags', function(err, req, res, json) {
      assert.equal(json.length, 11);
      done();
    });
  });

  it('should not be possible to remove a non-existing tag', function(done) {
    client.del('/tags/50', function(err, req, res, json) {
      assert.equal(res.statusCode, 404);
      assert.equal(json.message, 'Not found');
      done();
    });
  });

  it('should be possible to remove a tag', function(done) {
    client.del('/tags/3', function(err, req, res) {
      assert.equal(res.statusCode, 204);
      done();
    });
  });

  it('should log out', function(done) {
    client.del('/sessions/current', function(err, req, res) {
      assert.equal(res.statusCode, 204);
      done();
    });
  });

});