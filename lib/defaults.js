var path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');

exports.DEBUG = false;

// Basic settings
exports.DB = '';
exports.TIME_ZONE = 'America/Chicago';
exports.SITE_TITLE = 'Captain.js';
exports.SITE_URL = 'http://example.com/';
exports.POSTS_BY_PAGE = 5;
exports.THEME = 'default';

// Not editable
exports.THEMES_ROOT = path.join(PROJECT_ROOT, 'themes');
exports.THEME_ROOT = path.join(exports.THEMES_ROOT, exports.THEME);
exports.TEMPLATE_DIR = path.join(exports.THEME_ROOT, 'templates');
exports.STATIC_ROOT = path.join(exports.THEME_ROOT, 'public');
exports.SECRET_KEY = '';
exports.SITE_ID = '';

// Advanced settings
exports.DATE_FORMAT = 'F jS, Y';
exports.SESSION_MAXAGE = '30 minutes';
exports.STATIC_URL = '/';
exports.MEDIA_ROOT = '';
exports.FAVICON = path.join(exports.THEME_ROOT, 'public', 'img', 'favicon.ico');
exports.HOST = 'localhost';
exports.PORT = 3000;

// Low-level settings
exports.PBKDF2_ITERATIONS = 10000;
exports.PBKDF2_KEYLEN = 64;
exports.POSTS_BY_PAGE_ADMIN = 20;