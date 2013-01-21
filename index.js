var resource = require('express-resource'),
    express = require('express'),
    cons = require('consolidate'),
    swig = require('swig');

var settings = require('./lib/settings'),
    middleware = require('./lib/middleware'),
    sessions = require('./lib/resources/sessions'),
    users = require('./lib/resources/users'),
    posts = require('./lib/resources/posts'),
    tags = require('./lib/resources/tags');

var app = express();

var templateDir = settings.get('TEMPLATE_DIR'),
    staticRoot = settings.get('STATIC_ROOT'),
    mediaRoot = settings.get('MEDIA_ROOT');

// TODO: Remove this
app.getSettings = function() { return settings; };

// Templates
// TODO: allowErrors and cache only for dev
swig.init({ root: templateDir, allowErrors: true, cache: false });
app.set('views',templateDir);
app.set('view engine', 'html');
app.set('view options', { layout: false });
app.engine('.html', cons.swig);

// Locals
app.locals.SITE_TITLE = settings.get('SITE_TITLE');
app.locals.STATIC_URL = settings.get('STATIC_URL');

// Middleware
app.use(express.static(staticRoot));
app.use(express.bodyParser({ keepExtensions: true, uploadDir: mediaRoot }));
app.use(express.cookieParser());
app.use(express.logger('tiny'));
app.use(middleware.authenticate());
app.use(middleware.templates({cache: false}));

// Routes
app.post('/users/:user/posts', users.posts.set);
app.get('/users/:user/posts', users.posts.get);
app.resource('users', users);

app.post('/posts/:post/user', posts.user.set);
app.get('/posts/:post/user', posts.user.get);
app.post('/posts/:post/tags', posts.tags.set);
app.get('/posts/:post/tags', posts.tags.get);
app.resource('posts', posts);

app.get('/tags/:tag/posts', tags.posts.get);
app.resource('tags', tags);

app.resource('sessions', sessions);

// TODO: Maybe move this up
app.use(app.router);
app.use(express.errorHandler()); //TODO: Only for dev, otherwise response with something stupid
app.use(middleware.notFound());

if(require.main === module) {
  app.listen(8080, function() {
    console.log('Listening at http://localhost:8080');
  });
}

module.exports = app;