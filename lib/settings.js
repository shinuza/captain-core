var os = require('os'),
    join = require('path').join,
    fs = require('fs');

var _ = require('underscore');

var defaults = require('./defaults'),
    signals = require('./signals'),
    util = require('./util');


const ENV = 'CAPTAINJS_SETTINGS';
const DEFAULT_FILENAME = exports.DEFAULT_FILENAME = 'settings.js';
const TMPL = exports.TMPL = _.template('exports.<%= key %> = <%= value %>;');
const CACHEABLE =  ['DATE_FORMAT', 'MENU', 'POSTS_BY_PAGE', 'SESSION_MAX_AGE', 'SITE_ID', 'SITE_TITLE', 'SITE_URL', 'STATIC_URL', 'THEME', 'TIME_ZONE'];

try {
  var settings = require(path());
} catch(e) {
  if(e.code === 'MODULE_NOT_FOUND') {
    settings = {};
  } else {
    throw e;
  }
}

exports.get = function get(key, other) {
  return settings[key] || other || defaults[key];
};

exports.set = function set(key, value) {
  if(_.isObject(key)) {
    _.each(key, function(value, key) {
      exports.set(key, value);
    });
  } else {
    settings[key] = value;
  }
  signals.emit('settings:change');
};

exports.toJSON = function toJSON() {
  var obj = {};
  _.each(defaults, function(value, key) {
    obj[key] = exports.get(key);
  });
  return obj;
};

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

exports.length = function length() {
  return _.size(settings);
};

function path(filename) {
  if(filename) {
    return join(defaults.APP_ROOT, filename);
  } else {
    return process.env[ENV] || join(defaults.APP_ROOT, DEFAULT_FILENAME);
  }
}
exports.path = path;

exports.cache = function cache(app) {
  function fn() {
    CACHEABLE.forEach(function(s) {
        app.locals[s] = exports.get(s);
      });
  }
  signals.on('settings:change', fn);
  fn();
};