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
  return str.replace(/-+/g, '-');
};

var eq = {},
    base = {
      'a': ['á', 'â', 'à', 'ä', 'å'],
      'ae': ['æ'],
      'c': ['ç'],
      'ue': ['ü'],
      'ss': ['ß'],
      'e': ['é', 'ê', 'è', 'ë'],
      'i': ['í', 'î', 'ì', 'ï'],
      'o': ['ð', 'ò', 'ó', 'ô', 'õ', 'ö'],
      'u': ['ù', 'ú', 'û', 'ü'],
      'y': ['ý', 'ÿ'],
      '-': ['/']
    };

_.each(base, function(value, key) {
  value.forEach(function(e) {
    eq[e] = key;
  });
});