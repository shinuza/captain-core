require('express-resource');
var express = require('express'),
    app = express(),
    settings = require('./settings');

var middleware = require('./lib/middleware');
var users = require('./lib/users');
var posts = require('./lib/posts');

app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(middleware.authenticate())

app.post('/login', users.login);
app.post('/logout', users.logout);
app.resource('users', users);
app.resource('posts', posts);

app.listen(settings.PORT, settings.HOST, function() {
  console.log('Listening at http://localhost:8080');
});