var path = require('path');
var _ = require('underscore');

var defaults = require('./defaults');
var signals = require('./signals');
var util = require('./util');

const ENV = 'CAPTAINJS_SETTINGS';
const FILE = 'settings.js';

try {
  var lookup = process.env[ENV] || path.join(process.cwd(), FILE);
  var settings = require(lookup);
} catch(e) {
  if(e.code === 'MODULE_NOT_FOUND') {
    util.abort(
      'Error: Could not find settings module, you can either : \n' +
       '- Define a ' + ENV +' environment variable (must be an absolute path) \n' +
       '- Add a "' + FILE + '" file in this directory'
    );
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