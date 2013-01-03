var assert = require('assert');
var restify = require('restify');

var client = restify.createJsonClient({
  url: 'http://localhost:8080'
});

var models = require('../lib/models');