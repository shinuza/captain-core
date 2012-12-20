require('express-resource');
var express = require('express'),
    app = express(),
    settings = require('./settings');

var users = require('./lib/users');
var posts = require('./lib/posts');

app.use(express.bodyParser());
app.use(express.cookieParser());

app.use(function(req, res, next) {
  req.user = null;
  if(!req.cookies.token) {
    next();
  } else {
    users.findByToken(req.cookies.token, function(err, user) {
      req.user = user;
      next();
    });
  }
});
app.use(app.router);
app.use(function(err, req, res, next) {
  if(err.statusCode) {
    res.json(err.statusCode, {error: err.message, statusCode: err.statusCode});
  } else if(err.syscall) {
    res.json(500, {error: 'An unexcepted error occured'});
  } else {
    next(err);
  }
});

app.post('/login', users.login);
app.post('/logout', users.logout);
app.resource('users', users);
app.resource('posts', posts);

app.listen(settings.PORT, settings.HOST, function() {
  console.log('Listening at http://localhost:8080');
});