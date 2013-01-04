require('express-resource');
var express = require('express'),
    app = express(),
    settings = require('./settings');

var middleware = require('./lib/middleware');
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(middleware.authenticate());


var users = require('./lib/users');
var posts = require('./lib/posts');
var tags = require('./lib/tags');

app.post('/users/login', users.login);
app.post('/users/logout', users.logout);
app.post('/users/:user/posts', users.posts.associate);
app.get('/users/:user/posts/', users.posts.list);
app.resource('users', users);

app.post('/posts/:post/user', posts.user.associate);
app.get('/posts/:post/user', posts.user.show);
app.post('/posts/:post/tags', posts.tags.associate);
app.get('posts', posts.tags.list);
app.resource('posts', posts);

app.post('/tags/:tag/posts', tags.posts.associate);
app.get('/tags/:tag/posts', tags.posts.list);
app.resource('tags', tags);

app.listen(settings.PORT, settings.HOST, function() {
  console.log('Listening at http://%s:%d', settings.HOST, settings.PORT);
});