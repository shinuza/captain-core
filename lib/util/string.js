var _ = require('underscore');

/**
 * Transform `str` in its string equivalent
 *
 * @param str
 * @returns str
 */

exports.slugify = function slugify(str) {
  str = str.toLowerCase().replace(/\s+/g,'-');

  for(var key in eq) {
    if(eq.hasOwnProperty(key)) {
      str = str.replace(new RegExp(key, 'g'), eq[key]);
    }
  }

  str = str.replace(/[^a-zA-Z0-9\-]/g,'');
  str = str.replace(/-+/g, '-');
  return str;
};

var eq = {},
    base = {
    'a': 'áâàäå',
    'ae': 'æ',
    'c': 'ç',
    '\u00fc': ['ue'],
    '\u00f6': ['oe'],
    '\u00df': ['ss'],
    'e': 'éêèë',
    'i': 'íîìï',
    'o': 'ðòóôõö',
    'u': 'ùúûü',
    'y': 'ýÿ',
    '-': ['/']
  };

_.each(base, function(value, key) {
  var s = base[key];
  if(!_.isArray(s)) s = s.split('');
  s.forEach(function(e) {
    eq[e] = e;
  });
});
