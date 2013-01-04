var assert = require('assert');
var helpers = require('../lib/helpers');

describe('Helpers', function() {

  it('should slugify the given string', function() {
    var result = helpers.slugify("Un éléphant à l'orée du bois");
    assert.equal(result, 'un-elephant-a-loree-du-bois');
  });

  it('should pluck attributes from objects in an array', function() {
    var arr = [
      {name: 'John', age: 32},
      {name: 'Jeremy', age: 10},
      {name: 'Anna', age: 5}
    ];
    assert.deepEqual(helpers.pluck(arr, 'name'), ['John', 'Jeremy', 'Anna']);
    assert.deepEqual(helpers.pluck(arr, 'age'), [32, 10, 5]);
  });

});
