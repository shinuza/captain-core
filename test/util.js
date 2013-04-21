"use strict";

var assert = require('assert')
  , date = require('../lib/util/date')
  , string = require('../lib/util/string');


describe('Util', function() {

  it('should slugify the given string', function() {
    var result = string.slugify("Un éléphant à l'orée du bois");
    assert.equal(result, 'un-elephant-a-loree-du-bois');
  });

  it('should convert a timezone to its minutes equivalent', function() {
    var result = date.tzToMinutes(),
        result2 = date.tzToMinutes('America/Guyana'),
        result3 = date.tzToMinutes('Asia/Tokyo'),
        result4 = date.tzToMinutes('Lol/Cat');

    assert.strictEqual(result, 0);
    assert.strictEqual(result2, 240);
    assert.strictEqual(result3, -540);
    assert.strictEqual(result4, 0);
  });

  it('should convert a human interval into a date', function() {
    var result,
        d = new Date(),
        d2 = new Date(d);

    d2.setDate(d2.getDate() + 2);
    d2.setHours(d2.getHours() + 4);
    d2.setSeconds(d2.getSeconds() + 50);

    result = date.stampify('2 days, 4 hours, 50 seconds', d);

    assert.equal(result.toJSON(), d2.toJSON());
  });

});
