var resource = require('express-resource'),
    express = require('express'),
    cons = require('consolidate'),
    swig = require('swig');

var util = require('./lib/util'),
    settings = require('./lib/settings'),
    filters = require('./lib/filters'),
    middleware = require('./lib/middleware'),
    signals = require('./lib/signals'),

    feed = require('./lib/resources/feed'),
    setup = require('./lib/resources/setup'),
    sessions = require('./lib/resources/sessions'),
    users = require('./lib/resources/users'),
    posts = require('./lib/resources/posts'),
    tags = require('./lib/resources/tags');

var app = express();

var debug = settings.get('DEBUG'),
    templateDir = settings.get('TEMPLATE_DIR'),
    staticRoot = settings.get('STATIC_ROOT'),
    mediaRoot = settings.get('MEDIA_ROOT');

app.modules = {
  'settings': settings,
  'middleware': middleware,
  'signals': signals
};

// Templates
swig.init({
  root: templateDir,
  allowErrors: debug,
  cache: !debug,
  tzOffset: util.tzToMinutes(settings.get('TIME_ZONE')),
  filters: filters
});
app.set('views',templateDir);
app.set('view engine', 'html');
app.set('view options', { layout: false });
app.engine('.html', cons.swig);

// Middleware
app.use(express.bodyParser({ keepExtensions: true, uploadDir: mediaRoot }));
app.use(express.cookieParser());
app.use(express.favicon(settings.get('FAVICON')));
app.use(middleware.charset('utf-8'));
app.use(middleware.authenticate(true));
app.configure('development', function() {
  app.use(express.static(staticRoot));
  app.use(express.logger('dev'));
  app.use(express.responseTime());
  app.use(middleware.configurationHandler());
});
app.use(app.router);
app.use(middleware.notFoundHandler());
app.use(middleware.errorHandler());

// Routes
app.get('/', posts.index);
app.get('/posts/count', posts.count);
app.get('/posts/count_published', posts.countPublished);
app.post('/posts/:post/tags', posts.tags.set);
app.get('/posts/:post/tags', posts.tags.get);
app.resource('posts', posts);

app.get('/tags/:tag/posts', tags.posts.get);
app.get('/tags/count', tags.count);
app.resource('tags', tags);

app.get('/users/count', users.count);
app.resource('users', users);

app.post('/setup/database', setup.database);
app.get('/setup/connection-test', setup.connectionTest);
app.get('/setup/table-creation', setup.tableCreation);
app.resource('setup', setup);

app.resource('sessions', sessions);
app.resource('feed', feed);

// Locals
function cacheSettings() {
  ['SITE_TITLE', 'SITE_ID', 'SITE_URL', 'STATIC_URL', 'DATE_FORMAT', 'POSTS_BY_PAGE',
    'TIME_ZONE', 'THEME', 'SESSION_MAX_AGE'].forEach(function(s) {
      app.locals[s] = settings.get(s);
    });
}
signals.on('settings:change', cacheSettings);
cacheSettings();

if(require.main === module) {
  var port = settings.get('PORT');
  app.listen(port, function() {
    console.log('Listening at http://localhost:%d', port);
  });
}

module.exports = app;