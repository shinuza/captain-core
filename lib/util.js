var crypto = require('crypto');

var _ = require('underscore'),
    TZDate = require('zoneinfo').TZDate,
    winston = require('winston');

var exceptions = require('./exceptions'),
    settings = require('./settings.js');

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

/**
 * Checkes if `req` as a session and a user
 *
 * @param req
 * @returns Boolean
 */

function isLoggedIn(req) {
  return !!(req.session && req.session.user);
}
exports.isLoggedIn = isLoggedIn;

/**
 * Middleware indicating that the view `fn` requires login
 * @param fn
 * @returns {Function}
 */

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

/**
 * Transform `str` in its string equivalent
 *
 * @param str
 * @returns str
 */

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

/**
 * Passes an encoded version of `password` to `cb` or and error
 *
 * @param password
 * @param cb
 */

function encode(password, cb) {
  var secret_key = settings.get('SECRET_KEY'),
      iterations = settings.get('PBKDF2_ITERATIONS'),
      keylen = settings.get('PBKDF2_KEYLEN');

  crypto.pbkdf2(password, secret_key, iterations, keylen, function(err, derivedKey) {
    if(err) return cb(err);
    var str = new Buffer(derivedKey).toString('base64');
    cb(null, str);
  });
}
exports.encode = encode;

/**
 * Transforms `tzn` in its minutes equivalent, see http://en.wikipedia.org/wiki/List_of_tz_database_time_zones
 *
 * @example
 *  util.tzToMinutes('Asia/Tokyo');
 *  // -540
 *
 * @param tzn
 * @returns {number}
 */

function tzToMinutes(tzn) {
  var d = new TZDate(null, tzn).format('O');
  var sign = d[0];
  var hours = parseInt(d.slice(1, 3), 10);
  var minutes = parseInt(d.slice(3), 10);
  return (hours * 60 + minutes) * (sign == '+' ? -1 : 1);
}
exports.tzToMinutes = tzToMinutes;

/**
 * Applies `interval` to `date` or to Date.now()
 *
 * @example
 *  util.stampify('3 hours', new Date(2013, 2, 3, 4, 40, 3));
 *  // Sun Mar 03 2013 07:40:03 GMT+0100 (CET)
 * @param interval
 * @param date
 * @returns Date
 */

function stampify(interval, date) {
  var match, parts, value, unit, method, actual;
  date = date || (new Date);

  parts = interval.split(',');
  parts.forEach(function (part) {
    match = part.trim().match(/(\d{1,2})\s*(\w+)/);
    value = parseInt(match[1], 10);
    unit = match[2];
    method = STAMP_MAP[unit];
    actual = date['get' + method]();
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

/**
 * An instance of `winston.Logger`
 */

/**
 * An instance of `winston.Logger`
 */

var logger;
// Avoiding dependency loop preventing settings to be accessed
Object.defineProperty(exports, 'logger', {
  get : function(){
    if(!logger) {
      logger = new winston.Logger({
        transports: [
          new winston.transports.File({ filename: settings.get('LOGFILE') })
        ]
      });
    }
    return logger;
  }
});