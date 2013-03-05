var crypto = require('crypto');

var _ = require('underscore'),
    TZDate = require('zoneinfo').TZDate;

var exceptions = require('./exceptions');

const STAMP_MAP = {
  'second': 'Seconds',
  'seconds': 'Seconds',
  'minute': 'Minutes',
  'minutes': 'Minutes',
  'hour': 'Hours',
  'hours': 'Hours',
  'day': 'Date',
  'days': 'Date',
  'month': 'Month',
  'months': 'Month',
  'year': 'FullYear',
  'years': 'FullYear'
};

const TRANS = {};
const DICT = { 'a': 'áâàäå', 'ae': 'æ', 'c': 'ç', '\u00fc': ['ue'], '\u00f6': ['oe'], '\u00df': ['ss'], 'e': 'éêèë', 'i': 'íîìï', 'o': 'ðòóôõö', 'u': 'ùúûü', 'y': 'ýÿ', '-': ['/']};

for (var l in DICT) {
  var s = DICT[l];
  if(!_.isArray(s)) s = s.split('');
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
      next(new exceptions.PermissionRequired());
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
  var settings = require('./settings');
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

function stampify(interval, date) {
  date = date || (new Date);

  var parts = interval.split(',');
  parts.forEach(function (part) {
    var match = part.trim().match(/(\d{1,2})\s*(\w+)/);
    var value = parseInt(match[1], 10), unit = match[2];
    var method = STAMP_MAP[unit];
    var actual = date['get' + method]();
    date['set' + method](actual + value);
  });
  return date;
}
exports.stampify = stampify;


/**
 * Abort with the given `str` and `err`.
 *
 * @param {String} str
 * @param {Error} err
 */
function abort(str, err) {
  console.error(red(str));
  if(err) console.log(err);
  process.exit(1);
}
exports.abort = abort;

/**
 * Exit gracefully with the given `str`.
 *
 * @param {String} str
 */
function exit(str) {
  console.log(cyan(str));
  process.exit(0);
}
exports.exit = exit;

/**
 * Returns the `str` with red markers.
 *
 * @param {String} str
 */
function red(str) {
  return '\x1b[31m' + str + '\x1b[0m';
}
exports.red = red;

/**
 * Returns the `str` with yellow markers.
 *
 * @param {String} str
 */
function yellow(str) {
  return '\x1b[33m' + str + '\x1b[0m';
}
exports.yellow = yellow;

/**
 * Returns the `str` with cyan markers.
 *
 * @param {String} str
 */
function cyan(str) {
  return '\x1b[36m' + str + '\x1b[0m';
}
exports.cyan = cyan;

exports.log = console.log.bind(console);