var path = require('path');

var PROJECT_ROOT = exports.PROJECT_ROOT = path.resolve(__dirname, '..');
var APP_ROOT = exports.APP_ROOT = path.dirname(require.main.filename);

exports.DEBUG = true;

// Basic settings
exports.DB = '';
exports.TIME_ZONE = 'America/Chicago';
exports.SITE_TITLE = 'Captain.js';
exports.SITE_URL = 'http://example.com/';
exports.POSTS_BY_PAGE = 5;
exports.THEME = 'default';
exports.MENU = {
  'Home': '/',
  'Tags': '/tags'
};

// Not editable
exports.THEMES_ROOT = path.join(APP_ROOT, 'assets', 'themes');
exports.THEME_ROOT = path.join(exports.THEMES_ROOT, exports.THEME);
exports.TEMPLATE_DIR = path.join(exports.THEME_ROOT, 'templates');
exports.STATIC_ROOT = path.join(exports.THEME_ROOT, 'public');
exports.SECRET_KEY = '';
exports.SITE_ID = '';

// Advanced settings
exports.DATE_FORMAT = 'l, F j, Y'; //Friday, March 08, 2013
exports.SESSION_MAXAGE = '30 minutes';
exports.STATIC_URL = '/';
exports.MEDIA_ROOT = path.join(APP_ROOT, 'media');
exports.FAVICON = path.join(exports.THEME_ROOT, 'public', 'img', 'favicon.ico');
exports.HOST = 'localhost';
exports.PORT = 3000;
exports.LOGFILE = path.join(APP_ROOT, 'logs', 'error.log');

// Low-level settings
exports.PBKDF2_ITERATIONS = 10000;
exports.PBKDF2_KEYLEN = 64;
exports.POSTS_BY_PAGE_ADMIN = 20;
