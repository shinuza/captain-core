var restify = require('restify');
var server = restify.createServer();

var middleware = require('./lib/middleware');
var users = require('./lib/users');

server.use(restify.acceptParser(server.acceptable));
server.use(restify.authorizationParser());
server.use(middleware.authorizationHandler(server))
server.use(restify.dateParser());
server.use(restify.queryParser());
server.use(restify.bodyParser());

users(server);

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});