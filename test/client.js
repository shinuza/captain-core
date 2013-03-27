var restify = require('restify');
var conf = require('../lib/conf/');

module.exports = restify.createJsonClient({
  url: 'http://localhost:' + conf.port
});