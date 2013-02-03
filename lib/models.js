var path = require('path');
var fs = require('fs');
var pg = require('pg');

var settings = require('./settings');

var PROJECT_DIR = path.resolve(__dirname, '..');

function scripts(action) {
  var fullpath = path.join(PROJECT_DIR, 'sql', action);
  return fs.readdirSync(fullpath)
    .filter(function(file) {
      return path.extname(file) === '.sql';
    })
    .map(function(file) {
      return fs.readFileSync(path.join(fullpath, file)).toString();
    });
}

function syncAll(forceDrop, cb) {
  var s = [];
  var url = settings.get('DB');

  if(forceDrop) {
    s = s.concat(scripts('drop'));
  }
  s = s.concat(scripts('create'));

  pg.connect(url, function(err, client) {
    if(err) throw err;
    run(client);
  });

  function run(client) {
    var script = s.shift();
    if(script !== undefined) {
      console.log('Running: \n========\n%s\n', script);
      client.query(script, function (err) {
        if(err) cb(err);
        else run(client);
      });
    } else {
      client.end();
      cb();
    }
  }

}
exports.syncAll = syncAll;

function load(filename, cb) {
  console.log('Loading', path.join(process.cwd(),filename))
  var json = require(path.join(process.cwd(),filename));
  var model = exports[json.table];
  var rows = json.rows;

  run();
  function run() {
    var row = rows.shift();
    if(row !== undefined) {
      model.create(row, function(err) {
        if(err) cb(err);
        else run();
      });
    } else {
      cb();
    }
  }
}
exports.load = load;

exports.tags = require('./models/tags');
exports.posts = require('./models/posts');
exports.tokens = require('./models/tokens');
exports.posts_tags = require('./models/posts_tags');
exports.users = require('./models/users');