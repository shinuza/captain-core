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
    sessions = require('./lib/resources/sessions'),
    users = require('./lib/resources/users'),
    posts = require('./lib/resources/posts'),
    tags = require('./lib/resources/tags');

var app = express();

var debug = settings.get('DEBUG'),
    templateDir = settings.get('TEMPLATE_DIR'),
    staticRoot = settings.get('STATIC_ROOT'),
    mediaRoot = settings.get('MEDIA_ROOT');


app.settings = settings;
app.middleware = middleware;
app.signals = signals;

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

// Locals
app.locals.SITE_TITLE = settings.get('SITE_TITLE');
app.locals.SITE_ID = settings.get('SITE_ID');
app.locals.SITE_URL = settings.get('SITE_URL');
app.locals.STATIC_URL = settings.get('STATIC_URL');
app.locals.POSTS_BY_PAGE = settings.get('POSTS_BY_PAGE');
app.locals.DATE_FORMAT = settings.get('DATE_FORMAT');

// Middleware
app.use(express.static(staticRoot));
app.use(express.bodyParser({ keepExtensions: true, uploadDir: mediaRoot }));
app.use(express.cookieParser());
app.use(middleware.authenticate());
app.use(app.router);
app.use(middleware.errorHandler());

// Routes
app.resource('users', users);

app.get('/', posts.index);
app.post('/posts/:post/tags', posts.tags.set);
app.get('/posts/:post/tags', posts.tags.get);
app.resource('posts', posts);

app.get('/tags/:tag/posts', tags.posts.get);
app.resource('tags', tags);

app.resource('sessions', sessions);
app.resource('feed', feed);

if(require.main === module) {
  var port = settings.get('PORT');
  app.listen(port, function() {
    console.log('Listening at http://localhost:%d', port);
  });
}

module.exports = app;