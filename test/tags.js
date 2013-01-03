var assert = require('assert');
var restify = require('restify');
var Sequelize = require("sequelize");

var client = restify.createJsonClient({
  url: 'http://localhost:8080'
});

var models = require('../lib/models');

function factory(nb, cb) {
  var tagChainer = new Sequelize.Utils.QueryChainer;
  for(var i = 0; i < nb; i++) {
    var p = models.Tag.build({title: 'tag ' + i, slug: "tag-" + i});
    tagChainer.add(p.save());
  }
  tagChainer.run().success(cb).error(function(error) {throw error});
}

before(function(done) {
  factory(10, function() {
    client.post('/logout', {}, function(err) {
      if(err) throw err;
      done();
    });
  });
});

describe('Posts:', function() {

  it('should not be possible to create a tag with an existing slug', function(done) {
    client.post('/tags',
      {title: 'tag 5'}, function(err, req, res) {
        assert.equal(res.statusCode, 409);
        done();
      });
  });

  it('should be possible to create tags', function(done) {
    client.post('/tags',
      {title: 'Some other title'}, function(err, req, res) {
        assert.ifError(err);
        assert.equal(res.statusCode, 201);
        done();
      });
  });

  it('should be possible to edit posts', function(done) {
    client.put('/tags/some-other-title', {title: 'Some edited title 1'}, function(err, req, res) {
      assert.equal(res.statusCode, 201);
      done();
    });
  });

  it('should be possible to view a single post', function(done) {
    client.get('/tags/some-other-title', function(err, req, res) {
      var body = JSON.parse(res.body);

      assert.equal(res.statusCode, 200);
      assert.equal(body.title, 'Some edited title 1');
      assert.equal(body.slug, 'some-other-title');
      done();
    });
  });

  it('should be possible to view a non-existing post', function(done) {
    client.get('/tags/i-dont-exist', function(err, req, res) {
      var body = JSON.parse(res.body);

      assert.equal(res.statusCode, 404);
      assert.equal(body.error, 'Not found');
      done();
    });
  });


  it('should be possible to view multiple posts at once', function(done) {
    client.get('/tags', function(err, req, res) {
      var body = JSON.parse(res.body);

      assert.equal(body.length, 11);
      done();
    });
  });

  it('should be possible to view only a subset of posts', function(done) {
    client.get('/tags?offset=2&limit=3', function(err, req, res) {
      var body = JSON.parse(res.body);

      assert.equal(body.length, 3);
      assert.equal(body[0].title, 'tag 2');
      done();
    });
  });

  it('should be possible to remove a non-existing post', function(done) {
    client.del('/tags/i-dont-exist', function(err, req, res) {
      var body = JSON.parse(res.body);

      assert.equal(res.statusCode, 404);
      assert.equal(body.error, 'Not found');
      done();
    });
  });

  it('should be posible to remove a post', function(done) {
    client.del('/tags/tag-2', function(err, req, res) {
      assert.equal(res.statusCode, 204);
      done();
    });
  });

});