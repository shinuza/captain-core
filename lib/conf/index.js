var os = require('os'),
    fs = require('fs'),
    _ = require('underscore'),
    defaults = require('./defaults.js'),
    join = require('path').join,
    cwd = process.cwd();


var env = process.env['NODE_ENV'] || 'development';

//TODO Make this configurable
var loaders = [
  require('./loaders/node')
];

function path(file) {
  return join(cwd, 'conf', file);
}

function load(env) {
  var conf, loader;

  for(var i = 0, l = loaders.length; i < l; i++) {
    loader = loaders[i];
    try {
      conf = loader.read(path(env + loader.ext));
    } catch(e) {}
  }

  if(!conf) {
    console.error(new Date);
    console.error('Unable to load configuration file for `%s`', env);
    console.error('Tried:\n%s\n\n',
      _.map(loaders, function(loader) {
        return '    - ' + path(env + loader.ext);
      }).join(os.EOL)
    );
  } else {
    return conf;
  }
}

module.exports = _.extend(defaults, load(env));