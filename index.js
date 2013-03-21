var resource = require('express-resource'),
    express = require('express');

var util = require('./lib/util'),
    conf = require('./lib/conf'),
    middleware = require('./lib/middleware'),
    templates = require('./lib/templates.js'),

    feed = require('./lib/resources/feed'),
    sessions = require('./lib/resources/sessions'),
    users = require('./lib/resources/users'),
    posts = require('./lib/resources/posts'),
    tags = require('./lib/resources/tags');

var app = express(),
    join = require('path').join;

app.conf = conf;

// Locals
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
});
app.use(app.router);
app.use(middleware.errorHandler());

// Routes
app.get('/', posts.index);
app.get('/archive', posts.archive);
app.get('/posts/count', posts.count);
app.get('/posts/count_published', posts.countPublished);
app.post('/posts/:post/tags', posts.tags.set);
app.get('/posts/:post/tags', posts.tags.get);
app.resource('posts', posts);

app.get('/tags/:tag/', tags.posts.get);
app.get('/tags/count', tags.count);
app.resource('tags', tags);

app.get('/users/count', users.count);
app.resource('users', users);

app.resource('conf', conf);
app.resource('sessions', sessions);
app.resource('feed', feed);

if(require.main === module) {
  app.listen(conf.port, function() {
    console.log('Listening at http://localhost:%d', conf.port);
  });
}

module.exports = app;