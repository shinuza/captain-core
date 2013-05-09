"use strict";

var _ = require('underscore')
  , defaults = require('./defaults.js')
  , join = require('path').join
  , cwd = process.cwd()
  , env = process.env['NODE_ENV'] || 'development';

// TODO: Make this configurable
var loaders = [
  require('./loaders/node')
];

function load(env, root) {
  var loader
    , path
    , conf = {};

  for(var i = 0, l = loaders.length; i < l; i++) {
    loader = loaders[i];
    try {
      path = join(root || cwd, 'conf', env + loader.ext);
      conf = loader.read(p);
    } catch(e) {}
  }

  return conf;
}

var loaded = load(env);
loaded.reload = function(path) {
  load(env, path);
};

module.exports = _.extend(defaults, loaded);