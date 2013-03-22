#! /usr/bin/env node
var path = require('path');
var fs = require('fs');
var join = path.join;
var markdox = require('markdox');

var PROJECT_ROOT = path.resolve(__dirname, '..');

var lib_path = join(PROJECT_ROOT, 'lib');
var doc_path = join(PROJECT_ROOT, 'docs');

function generate(dir, includeIndex) {
  var sourceDir = join(lib_path, dir);
  var outputDir = join(doc_path, dir);

  if(!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  fs.readdirSync(sourceDir).forEach(function(file) {
    if(!includeIndex && file == 'index.js') return;
    var sourceFile = join(sourceDir, file);
    var outputFile = path.basename(file, '.js') + '.md';

    markdox.process([sourceFile], join(outputDir, outputFile), function() {
      console.log('Generated', join(dir, outputFile));
    });
  });
}

generate('models');
generate('resources');