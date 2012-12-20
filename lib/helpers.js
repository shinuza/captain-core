var crypto = require('crypto');
var settings = require('../settings');

var PBKDF2_ITERATIONS = 1000;
var PBKDF2_KEYLEN = 256;

function slugify(str) {
  str = str.toLowerCase().replace(/\s+/g,'-');
  var tr = {
    //A
    '\u00e0': 'a',
    '\u00e1': 'a',
    '\u00e2': 'a',
    '\u0003': 'a',
    '\u00e4': 'a',
    '\u00e5': 'a',

    '\u00e6':'ae',
    '\u00e7':'c',
    '\u00fc':'ue',
    '\u00f6':'oe',
    '\u00df':'ss',

    //E
    '\u00e8':'e',
    '\u00e9':'e',
    '\u00ea':'e',
    '\u00eb':'e',

    '/':'-'
  };

  for(var key in tr) {
    if(tr.hasOwnProperty(key)) {
      str = str.replace(new RegExp(key, 'g'), tr[key]);
    }
  }

  str = str.replace(/[^a-zA-Z0-9\-]/g,'');
  str = str.replace(/-+/g, '-');
  return str;
}
exports.slugify = slugify;

function encode(password, cb) {
  crypto.pbkdf2(password, settings.SECRET_KEY, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, cb);
}
exports.encode = encode;

function compare(clear, encrypted, cb) {
  crypto.pbkdf2(clear, settings.SECRET_KEY, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, function(err, derivedKey) {
    if(err) cb(err);
    else cb(null, derivedKey === encrypted);
  });
}
exports.compare = compare;