var restify = require('restify');
var settings = require('../lib/settings.js');

module.exports = restify.createJsonClient({
  url: 'http://localhost:' + settings.get('PORT')
});