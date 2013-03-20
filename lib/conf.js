var os = require('os'),
    join = require('path').join,
    fs = require('fs');

var _ = require('underscore');

var defaults = require('./defaults'),
    signals = require('./signals'),
    util = require('./util');

var cwd = process.cwd();

const ENV = 'CAPTAINJS_SETTINGS';
const DEFAULT_FILENAME = exports.DEFAULT_FILENAME = 'conf.js';
const TMPL = exports.TMPL = _.template('exports.<%= key %> = <%= value %>;');
const CACHEABLE =  ['DATE_FORMAT', 'MENU', 'POSTS_BY_PAGE', 'SESSION_MAX_AGE', 'SITE_ID', 'SITE_TITLE', 'SITE_URL', 'STATIC_URL', 'THEME', 'TIME_ZONE'];

try {
  var conf = require(path());
} catch(e) {
  if(e.code === 'MODULE_NOT_FOUND') {
    conf = {};
  } else {
    throw e;
  }
}

/**
 * Gets `key` or falls back to default value for that `key`
 *
 * @param key
 * @returns {*}
 */

exports.get = function get(key) {
  return conf[key] ||  defaults[key];
};

/**
 * Sets `key` to `value`
 * `key` can be a String or an hash
 *
 * @param {Object} key
 * @param {*} value
 */

exports.set = function set(key, value) {
  if(_.isObject(key)) {
    _.each(key, function(value, key) {
      exports.set(key, value);
    });
  } else {
    conf[key] = value;
  }
  signals.emit('conf:change');
};

/**
 * Standard toJSON function
 *
 * @returns {Object}
 */

exports.toJSON = function toJSON() {
  var obj = {};
  _.each(defaults, function(value, key) {
    obj[key] = exports.get(key);
  });
  return obj;
};

/**
 * Writes `obj` to path `p`
 *
 * @param {Object} obj
 * @param {String} p
 * @returns {*}
 */

exports.save = function save(obj, p) {
  var output = [];

  _.each(obj, function(value, key) {
    value = typeof value === 'string' ? "'" + value + "'" : value;
    output.push(TMPL({value: value, key: key}));
  });

  try {
    fs.writeFileSync(p, output.join(os.EOL));
    return null;
  } catch(e) {
    return e;
  }
};

/**
 * Returns the length of conf
 *
 * @returns {Number}
 */

exports.length = function length() {
  return _.size(conf);
};

/**
 * Returns a conf path
 *
 * @returns {String}
 */

function path(filename) {
  return process.env[ENV] || join(cwd, DEFAULT_FILENAME);
}
exports.path = path;

/**
 * Exposes conf in `CACHEABLE` to `app`
 *
 * @param app
 */

exports.cache = function cache(app) {
  function fn() {
    CACHEABLE.forEach(function(s) {
      app.locals[s] = exports.get(s);
    });
  }
  signals.on('conf:change', fn);
  fn();
};