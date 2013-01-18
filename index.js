require('express-resource');
var express = require('express'),
    app = express(),
    settings = require('./lib/settings');

var middleware = require('./lib/middleware');
var sessions = require('./lib/resources/sessions');
var users = require('./lib/resources/users');
var posts = require('./lib/resources/posts');
var tags = require('./lib/resources/tags');

app.getSettings = function() {return settings};
app.use(express.bodyParser({ keepExtensions: true, uploadDir: settings.get('MEDIA_ROOT') }));
app.use(express.cookieParser());
app.use(middleware.authenticate());
app.use(express.logger('tiny'));

app.post('/users/:user/posts', users.posts.associate);
app.get('/users/:user/posts', users.posts.list);
app.resource('users', users);

app.post('/posts/:post/user', posts.user.associate);
app.get('/posts/:post/user', posts.user.show);
app.get('/posts/:post/tags', posts.tags.list);
app.resource('posts', posts);

app.post('/tags/:tag/posts', tags.posts.associate);
app.get('/tags/:tag/posts', tags.posts.list);
app.resource('tags', tags);

app.resource('sessions', sessions);

app.use(app.router);
//TODO: Only for dev, otherwise response with something stupid
app.use(express.errorHandler());
app.use(middleware.notFound());


if(require.main === module) {
  app.listen(8080, function() {
    console.log('Listening at http://localhost:8080');
  });
}

module.exports = app;