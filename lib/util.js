var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var util = require('util');

var settings = require('./settings');
var errors = require('./errors');

const TRANS = {};
const DICT = { 'a': 'áâàäå', 'ae': 'æ', 'c': 'ç', '\u00fc': ['ue'], '\u00f6': ['oe'], '\u00df': ['ss'], 'e': 'éêèë', 'i': 'íîìï', 'o': 'ðòóôõö', 'u': 'ùúûü', 'y': 'ýÿ', '-': ['/']};

for (var l in DICT) {
  var s = DICT[l];
  if(!util.isArray(s)) s = s.split('');
  s.forEach(function(e) {
    TRANS[e] = l;
  });
}

function dig(dir, ext) {
  var p,
      sub,
      isDir,
      out = [],
      files = fs.readdirSync(dir);

  files.forEach(function(file) {
    p = path.join(dir, file);
    isDir = fs.statSync(p).isDirectory();
    if(isDir) {
      sub = dig(p, ext);
      out = out.concat(sub);
    } else {
      out.push(p);
    }
  });

  if(ext) {
    out = out.filter(function(file) {
      return path.extname(file) === ext;
    });
  }

  return out;
}
exports.dig = dig;

function isStaff(req) {
  return req.session && req.session.user && req.session.user.isStaff;
}
exports.isStaff = isStaff;

function loginRequired(fn) {
  return function(req, res, next) {
    if(isStaff(req)) {
      fn(req, res, next);
    } else {
      next(new errors.PermissionRequired);
    }
  }
}
exports.loginRequired = loginRequired;

function slugify(str) {
  str = str.toLowerCase().replace(/\s+/g,'-');

  for(var key in TRANS) {
    if(TRANS.hasOwnProperty(key)) {
      str = str.replace(new RegExp(key, 'g'), TRANS[key]);
    }
  }

  str = str.replace(/[^a-zA-Z0-9\-]/g,'');
  str = str.replace(/-+/g, '-');
  return str;
}
exports.slugify = slugify;

function encode(password, cb) {
  crypto.pbkdf2(password, settings.get('SECRET_KEY'), settings.get('PBKDF2_ITERATIONS'), settings.get('PBKDF2_KEYLEN'), function(err, derivedKey) {
    if(err) return cb(err);
    var str = new Buffer(derivedKey).toString('base64');
    cb(null, str);
  });
}
exports.encode = encode;

function compare(clear, encrypted, cb) {
  encode(clear, function(err, derivedKey) {
    if(err) cb(err);
    else cb(null, derivedKey === encrypted);
  });
}
exports.compare = compare;

function onError(res) {
  return function(err) {
    // TODO add logging
    console.log(err);
    res.send(500, {"error": "An unexpected error occurred"});
  }
}
exports.onError = onError;

function pluck(arr, attr) {
  if(!isArray(arr)) return [];
  return arr.map(function(obj) {
    return obj[attr];
  });
}
exports.pluck = pluck;

exports.isArray = isArray = util.isArray;

exports.log = console.log.bind(console);