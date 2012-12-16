var assert = require('assert');
var restify = require('restify');
var db = require('riak-js').getClient();

// Creates a JSON client
var client = restify.createJsonClient({
  url: 'http://localhost:8080'
});

describe('Posts:', function() {
  it('should be able to create posts', function(done) {
    client.post('/posts',
    {slug: 'some-title', title: 'Some title', date: new Date(), content: "Lorem ipsum"}, function(err, req, res) {
      assert.equal(res.statusCode, 201);
      done();
    });
  });
});