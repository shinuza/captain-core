var path = require('path');
var fs = require('fs');

var pg = require('pg');

var settings = require('./settings'),
    util = require('./util.js');

const PROJECT_DIR = path.resolve(__dirname, '..');


/**
 * Retuns a list of sql files in the sql/`action` directory
 * @param {String} action
 * @return {Array}
 */

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

/**
 * Drop/Create table with the schema found in the sql directory
 * @param {Object} options
 */

function syncDB(options) {
  var uri = options.uri || settings.get('DB');
  var s = (options.forceDrop ? scripts('drop') : []).concat(scripts('create'));

  connect(uri, function(err, client) {
    if(err) throw err;
    run(client);
  });

  function run(client) {
    var script = s.shift();
    if(script !== undefined) {
      options.onprogress(script);
      client.query(script, function (err) {
        if(err) options.oncomplete(err);
        else run(client);
      });
    } else {
      client.end();
      options.oncomplete();
    }
  }

}
exports.syncDB = syncDB;

/**
 * Loads `filename` in the database
 * @param {String} filename
 */

function load(filename) {

  return function(cb) {
    console.log('Loading', path.join(process.cwd(),filename));
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
  };
}
exports.load = load;

/**
 * Connects database at `db`
 * @param uri
 * @param cb
 */

function connect(uri, cb) {
  pg.connect(uri, function(err, client) {
    if(err) return cb(err);
    else return cb(null, client);
  });
}
exports.connect = connect;

/**
 * Executes the statement `sql` with `args`
 * @param {String} sql
 * @param {Array} args
 * @param {Function} cb
 */

function query(sql, args, cb) {
  var db = settings.get('DB');
  connect(db, function(err, client) {
    if(typeof cb === 'undefined') cb = args;
    if(err) {
      util.logger.error('Fatal error: Unable to connect to database ',  err);
      return cb(err);
    }
    client.query(sql, args, cb);
  });
}
exports.query = query;

exports.tags = require('./models/tags');
exports.posts = require('./models/posts');
exports.tokens = require('./models/tokens');
exports.posts_tags = require('./models/posts_tags');
exports.users = require('./models/users');