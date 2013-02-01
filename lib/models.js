var path = require('path');
var fs = require('fs');
var anyDB = require('any-db');
var settings = require('./settings');

var PROJECT_DIR = path.resolve(__dirname, '..');

function getFiles(engine, action) {
  var fullpath = path.join(PROJECT_DIR, 'sql', engine, action);
  return fs.readdirSync(fullpath)
    .filter(function(file) {
      return path.extname(file) === '.sql';
    })
    .map(function(file) {
      return fs.readFileSync(path.join(fullpath, file)).toString();
    });
}

function syncAll(forceDrop, cb) {
  var scripts = [];
  var url = settings.get('DB');
  var conn = anyDB.createConnection(url);
  var engine = url.split(':')[0];
  if(forceDrop) {
    scripts = scripts.concat(getFiles(engine, 'drop'));
  }
  scripts = scripts.concat(getFiles(engine, 'create'));

  function run() {
    var script = scripts.shift();
    if(script !== undefined) {
      console.log('Running: \n========\n%s\n', script);
      conn.query(script, function (error) {
        if(error) cb(error);
        else run();
      });
    } else {
      cb();
    }
  }

  run();
}
exports.syncAll = syncAll;
