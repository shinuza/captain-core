var path = require('path');
var _ = require('underscore');

var defaults = require('./defaults');
var signals = require('./signals');

const ENV = 'CAPTAINJS_SETTINGS';
const FILE = 'settings.js';

try {
  var lookup = process.env[ENV] || path.join(process.cwd(), FILE);
  var settings = require(lookup);
} catch(e) {
  if(e.code === 'MODULE_NOT_FOUND') {
    console.error(
      'Error: Could not find settings module, you can either : \n' +
       '- Define a %s environment variable (must be an absolute path) \n' +
       '- Verify your current directory contains a "%s" file', ENV, FILE);
    process.exit(1);
  } else {
    throw e;
  }
}

exports.get = function get(key, other) {
  return settings[key] || other || defaults[key];
};

exports.set = function set(key, value) {
  if(_.isObject(key)) {
    _.each(function(value, key) {
      exports.set(key, value);
    });
  } else {
    settings[key] = value;
  }
  signals.emit('settings:change');
};

exports.toJSON = function toJSON() {
  return settings;
};