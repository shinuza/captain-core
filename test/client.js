var restify = require('restify');
var settings = require('../lib/conf.js');

module.exports = restify.createJsonClient({
  url: 'http://localhost:' + settings.get('PORT')
});