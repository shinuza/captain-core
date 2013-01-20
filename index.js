require('express-resource');
var express = require('express'),
    app = express(),
    settings = require('./lib/settings');

var cons = require('consolidate'),
    swig = require('swig');

var middleware = require('./lib/middleware');
var sessions = require('./lib/resources/sessions');
var users = require('./lib/resources/users');
var posts = require('./lib/resources/posts');
var tags = require('./lib/resources/tags');

app.getSettings = function() { return settings; };

var templateDir = settings.get('TEMPLATE_DIR');
swig.init({
  root: templateDir,
  allowErrors: true // TODO: Only for dev
});
app.set('views',templateDir);
app.set('view engine', 'html');
app.set('view options', { layout: false });
app.engine('.html', cons.swig);
app.locals.siteTitle = settings.get('SITE_TITLE');

app.use(express.bodyParser({ keepExtensions: true, uploadDir: settings.get('MEDIA_ROOT') }));
app.use(express.cookieParser());
app.use(middleware.authenticate());
app.use(express.logger('tiny'));

app.post('/users/:user/posts', users.posts.associate);
app.get('/users/:user/posts', users.posts.list);
app.resource('users', users);

app.post('/posts/:post/user', posts.user.set);
app.get('/posts/:post/user', posts.user.get);
app.post('/posts/:post/tags', posts.tags.set);
app.get('/posts/:post/tags', posts.tags.get);
app.resource('posts', posts);

app.get('/tags/:tag/posts', tags.posts.get);
app.resource('tags', tags);

app.resource('sessions', sessions);

app.use(app.router);
app.use(express.errorHandler()); //TODO: Only for dev, otherwise response with something stupid
app.use(middleware.notFound());

if(require.main === module) {
  app.listen(8080, function() {
    console.log('Listening at http://localhost:8080');
  });
}

module.exports = app;