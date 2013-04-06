var cons = require('consolidate'),
    swig = require('swig'),
    conf = require('./conf/'),

    tzToMinutes = require('./util/date.js').tzToMinutes,
    filters = require('./filters.js'),

    debug = conf.env != 'production',
    cwd = process.cwd();

// Templates
swig.init({
  root: conf.template_dir,
  allowErrors: debug,
  cache: !debug,
  tzOffset: tzToMinutes(conf.time_zone),
  filters: filters
});

exports.setup = function setup(app) {
  app.set('views', conf.template_dir);
  app.set('view engine', 'html');
  app.set('view options', { layout: false });
  app.engine('.html', cons.swig);
};

exports.swig = swig;