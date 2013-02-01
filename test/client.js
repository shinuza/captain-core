var restify = require('restify');
var settings = require('../settings.js');

module.exports = restify.createJsonClient({
  url: 'http://localhost:' + settings.PORT
});