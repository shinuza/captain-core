var path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');

exports.DEBUG = false;

exports.SESSION_MAXAGE = 1000 * 3600;

exports.TIME_ZONE = 'America/Chicago';

exports.SITE_TITLE = 'Captain.js';
exports.POSTS_BY_PAGE = 5;

exports.THEMES_ROOT = path.join(PROJECT_ROOT, 'themes');
exports.THEME = 'default';
exports.THEME_ROOT = path.join(exports.THEMES_ROOT, exports.THEME);

exports.MEDIA_ROOT = '';

exports.TEMPLATE_DIR = path.join(exports.THEME_ROOT, 'templates');
exports.STATIC_ROOT = path.join(exports.THEME_ROOT, 'public');
exports.STATIC_URL = '/';


exports.PBKDF2_ITERATIONS = 10000;
exports.PBKDF2_KEYLEN = 64;