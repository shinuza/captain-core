var join = require('path').join,
    cwd = process.cwd();

// Basic conf
exports.db = '';
exports.time_zone = 'America/Chicago';
exports.site_title = 'Captain.js';
exports.site_url = 'http://example.com/';
exports.posts_by_page = 5;
exports.theme = 'default';

// Not editable
exports.themes_root = join(cwd, 'themes');
exports.theme_root = join(exports.THEMES_ROOT, exports.THEME);
exports.template_dir = join(exports.THEME_ROOT, 'templates');
exports.static_root = join(exports.THEME_ROOT, 'public');
exports.secret_key = '';
exports.site_id = '';

// Advanced conf
exports.date_format = 'l, F j, Y'; //Friday, March 08, 2013
exports.session_maxage = '30 minutes';
exports.static_url = '/';
exports.media_root = join(cwd, 'media');
exports.favicon = join(exports.STATIC_ROOT,'img', 'favicon.ico');
exports.host = 'localhost';
exports.port = 3000;

// Low-level conf
exports.pbkdf2_iterations = 10000;
exports.pbkdf2_keylen = 64;
exports.posts_by_page_admin = 20;
