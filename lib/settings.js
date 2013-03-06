var os = require('os'),
    path = require('path'),
    fs = require('fs');

var _ = require('underscore');

var defaults = require('./defaults'),
    signals = require('./signals'),
    util = require('./util');

const ENV = 'CAPTAINJS_SETTINGS';
const FILE = 'settings.js';
const TMPL = _.template('exports.<%= key %> = <%= value %>;');

try {
  var lookup = process.env[ENV] || path.join(process.cwd(), FILE);
  var settings = require(lookup);
  var keys = Object.keys(settings);
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

exports.save = function save(fn) {
  var output = [],
      toJSON = exports.toJSON();
  _.each(toJSON, function(value, key) {
    if(~keys.indexOf(key) || settings[key] !== defaults[key]){
      value = typeof value === 'string' ? "'" + value + "'" : value;
      output.push(TMPL({value: value, key: key}));
    }
  });
  fs.writeFile(lookup, output.join(os.EOL), fn);
};

exports.length = function length() {
  return _.size(settings);
};