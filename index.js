var express = require('express'),
    Resource = require('express-resource'),
    app = express(),
    settings = require('./settings');

app.use(express.bodyParser());

var users = require('./lib/users');
app.resource('users', users);
app.post('/login', users.login);
app.post('/logout', users.logout);

app.listen(settings.PORT, settings.HOST, function() {
  console.log('Listening at http://localhost:8080');
});