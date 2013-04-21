"use strict";

var cjson = require('cjson');

exports.read = function(file) {
  return cjson.load(file);
};

exports.ext = '.json';