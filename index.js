var express = require('express'),
    Resource = require('express-resource'),
    app = express(),
    settings = require('./settings');

app.use(express.bodyParser());

app.use(app.router);
app.use(function(err, req, res, next){
  if(err.statusCode) {
    res.json(err.statusCode, {error: err.message, statusCode: err.statusCode});
  } else {
    next(err);
  }
});

var users = require('./lib/users');
app.resource('users', users);
app.post('/login', users.login);
app.post('/logout', users.logout);

app.listen(settings.PORT, settings.HOST, function() {
  console.log('Listening at http://localhost:8080');
});