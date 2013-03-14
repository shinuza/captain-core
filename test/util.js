var assert = require('assert');
var util = require('../lib/util');


describe('Util', function() {

  it('should slugify the given string', function() {
    var result = util.slugify("Un éléphant à l'orée du bois");
    assert.equal(result, 'un-elephant-a-loree-du-bois');
  });

  it('should convert a timezone to its minutes equivalent', function() {
    var result = util.tzToMinutes(),
        result2 = util.tzToMinutes('America/Guyana'),
        result3 = util.tzToMinutes('Asia/Tokyo'),
        result4 = util.tzToMinutes('Lol/Cat');

    assert.strictEqual(result, 0);
    assert.strictEqual(result2, 240);
    assert.strictEqual(result3, -540);
    assert.strictEqual(result4, 0);
  });

  it('should convert a human interval into a date', function() {
    var result,
        date = new Date(),
        date2 = new Date(date);

    date2.setDate(date2.getDate() + 2);
    date2.setHours(date2.getHours() + 4);
    date2.setSeconds(date2.getSeconds() + 50);

    result = util.stampify('2 days, 4 hours, 50 seconds', date);

    assert.equal(result.toJSON(), date2.toJSON());
  });

});
