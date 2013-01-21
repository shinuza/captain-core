var path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');

exports.SESSION_MAXAGE = 1000 * 3600;

exports.PBKDF2_ITERATIONS = 10000;
exports.PBKDF2_KEYLEN = 128;

exports.SITE_TITLE = 'Captain.js';

exports.THEMES_ROOT = path.join(PROJECT_ROOT, 'themes');
exports.THEME = 'default';
exports.THEME_ROOT = path.join(exports.THEMES_ROOT, exports.THEME);

exports.MEDIA_ROOT = '';

exports.TEMPLATE_DIR = path.join(exports.THEME_ROOT, 'templates');
exports.STATIC_ROOT = path.join(exports.THEME_ROOT, 'public');
exports.STATIC_URL = '/';