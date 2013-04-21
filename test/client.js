"use strict";

var restify = require('restify')
  , conf = require('../lib/conf/');


module.exports = restify.createJsonClient({
  url: 'http://localhost:' + conf.port
});