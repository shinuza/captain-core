var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var util = require('util');

var TZDate = require('zoneinfo').TZDate;

var settings = require('./settings');
var errors = require('./exceptions');

const TRANS = {};
const DICT = { 'a': 'áâàäå', 'ae': 'æ', 'c': 'ç', '\u00fc': ['ue'], '\u00f6': ['oe'], '\u00df': ['ss'], 'e': 'éêèë', 'i': 'íîìï', 'o': 'ðòóôõö', 'u': 'ùúûü', 'y': 'ýÿ', '-': ['/']};

for (var l in DICT) {
  var s = DICT[l];
  if(!util.isArray(s)) s = s.split('');
  s.forEach(function(e) {
    TRANS[e] = l;
  });
}

function isLoggedIn(req) {
  return req.session && req.session.user;
}
exports.isLoggedIn = isLoggedIn;

function loginRequired(fn) {
  return function(req, res, next) {
    if(isLoggedIn(req)) {
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

function tzToMinutes(tzn) {
  var d = new TZDate(null, tzn).format('O');
  var sign = d[0];
  var hours = parseInt(d.slice(1, 3), 10);
  var minutes = parseInt(d.slice(3), 10);
  return (hours * 60 + minutes) * (sign == '+' ? -1 : 1);
}
exports.tzToMinutes = tzToMinutes;

function pluck(arr, attr) {
  if(!isArray(arr)) return [];
  return arr.map(function(obj) {
    return obj[attr];
  });
}
exports.pluck = pluck;

exports.isArray = isArray = util.isArray;

exports.log = console.log.bind(console);