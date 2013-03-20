var restify = require('restify');
var settings = require('../lib/conf/');

module.exports = restify.createJsonClient({
  url: 'http://localhost:' + settings.port
});