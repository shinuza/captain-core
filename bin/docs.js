#! /usr/bin/env node

var path = require('path')
  , fs = require('fs')
  , join = path.join
  , markdox = require('markdox')
  , root = path.resolve(__dirname, '..')
  , lib_path = join(root, 'lib')
  , doc_path = join(root, 'docs');


function generate(dir, includeIndex) {
  var sourceDir = join(lib_path, dir)
    , outputDir = join(doc_path, dir);

  if(!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  fs.readdirSync(sourceDir).forEach(function(file) {
    if(!includeIndex && file == 'index.js') return;
    var sourceFile = join(sourceDir, file)
      , outputFile = path.basename(file, '.js') + '.md';

    markdox.process([sourceFile], join(outputDir, outputFile), function() {
      console.log('Generated', join(dir, outputFile));
    });
  });
}

generate('models');
generate('resources');