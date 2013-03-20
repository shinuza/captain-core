var cwd = process.cwd();

var cons = require('consolidate'),
    swig = require('swig');

var debug = conf.get('env') != 'production';

exports.THEMES_ROOT = path.join(cwd, 'themes');
exports.THEME_ROOT = path.join(exports.THEMES_ROOT, exports.THEME);
exports.TEMPLATE_DIR = path.join(exports.THEME_ROOT, 'templates');
exports.STATIC_ROOT = path.join(exports.THEME_ROOT, 'public');


// Templates
swig.init({
  root: templateDir,
  allowErrors: debug,
  cache: !debug,
  tzOffset: util.tzToMinutes(conf.get('TIME_ZONE')),
  filters: filters
});
app.set('views', templateDir);
app.set('view engine', 'html');
app.set('view options', { layout: false });
app.engine('.html', cons.swig);