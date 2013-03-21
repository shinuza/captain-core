var resource = require('express-resource'),
    express = require('express');

var util = require('./lib/util'),
    conf = require('./lib/conf'),
    middleware = require('./lib/middleware'),
    templates = require('./lib/templates.js'),
    models = require('./lib/models'),
    resources = require('./lib/resources');

var app = express(),
    join = require('path').join;

// Locals
app.conf = conf;
app.models = models;
app.resources = resources;
Object.keys(conf).forEach(function(key) {
  app.locals[key] = conf[key];
});

// Templates
templates.setup(app);

// Middleware
app.use(express.bodyParser({ keepExtensions: true, uploadDir: conf.media_root }));
app.use(express.cookieParser());
app.use(express.favicon(join(conf.static_root, 'img', 'favicon.ico')));
app.use(middleware.charset('utf-8'));
app.use(middleware.authenticate(true));
app.configure('development', function() {
  app.use(express.static(conf.static_root));
  app.use(express.logger('dev'));
  app.use(express.responseTime());
  app.use(middleware.firstRun());
  app.post('/create_user', resources.users.create_user);
});
app.use(app.router);
app.use(middleware.errorHandler());

// Routes
app.get('/', resources.posts.index);
app.get('/archive', resources.posts.archive);
app.get('/posts/count', resources.posts.count);
app.get('/posts/count_published', resources.posts.countPublished);
app.post('/posts/:post/tags', resources.posts.tags.set);
app.get('/posts/:post/tags', resources.posts.tags.get);
app.resource('posts', resources.posts);

app.get('/tags/:tag/', resources.tags.posts.get);
app.get('/tags/count', resources.tags.count);
app.resource('tags', resources.tags);

app.get('/users/count', resources.users.count);
app.resource('users', resources.users);

app.resource('conf', resources.conf);
app.resource('sessions', resources.sessions);
app.resource('feed', resources.feed);

if(require.main === module) {
  app.listen(conf.port, function() {
    console.log('Listening at http://localhost:%d', conf.port);
  });
}

module.exports = app;