var assert = require('assert');
var util = require('../lib/util');

describe('Util', function() {

  it('should slugify the given string', function() {
    var result = util.slugify("Un éléphant à l'orée du bois");
    assert.equal(result, 'un-elephant-a-loree-du-bois');
  });

  it('should pluck attributes from objects in an array', function() {
    var arr = [
      {name: 'John', age: 32},
      {name: 'Jeremy', age: 10},
      {name: 'Anna', age: 5}
    ];
    assert.deepEqual(util.pluck(arr, 'name'), ['John', 'Jeremy', 'Anna']);
    assert.deepEqual(util.pluck(arr, 'age'), [32, 10, 5]);
  });

  it('should properly encode a password', function(done) {
    util.encode('admin', function(err, encrypted) {
      assert.ifError(err);
      util.compare('admin', encrypted, function(err, same) {
        assert.ifError(err);
        assert.equal(true, same);
        done()
      });
    });
  });

});
