var restify = require('restify');
var server = restify.createServer();

server.use(restify.acceptParser(server.acceptable));
server.use(restify.authorizationParser());
server.use(restify.dateParser());
server.use(restify.queryParser());
server.use(restify.bodyParser());

var users = require('./lib/users');

users(server);

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});