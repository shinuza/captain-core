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

  it('should convert a timezone to its minutes equivalent', function() {
    var result = util.tzToMinutes();
    var result2 = util.tzToMinutes('America/Chicago');
    var result3 = util.tzToMinutes('Asia/Tokyo');
    var result4 = util.tzToMinutes('Lol/Cat');
    assert.strictEqual(result, 0);
    assert.strictEqual(result2, 360);
    assert.strictEqual(result3, -540);
    assert.strictEqual(result4, 0);
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
