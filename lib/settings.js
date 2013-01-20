var path = require('path');

const ENV = 'CAPTAINJS_SETTINGS';
const FILE = 'settings.js';
const PROJECT_ROOT = path.resolve(__dirname, '..');

var defaults = {
  SESSION_MAXAGE: 1000 * 3600,
  PBKDF2_ITERATIONS: 10000,
  PBKDF2_KEYLEN: 128,
  TEMPLATE_DIR: path.join(PROJECT_ROOT, 'views'),
  SITE_TITLE: 'Captain.js'
};

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
  settings[key] = value;
};

exports.toJSON = function toJSON() {
  return settings;
};