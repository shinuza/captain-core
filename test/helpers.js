var assert = require('assert');
var helpers = require('../lib/helpers');

describe('Posts:helpers', function() {
  it('should slugify the given string', function() {
    var result = helpers.slugify("Un éléphant à l'orée du bois");
    assert.equal(result, 'un-elephant-a-loree-du-bois');
  });
});
