var path = require('path'),
    fs = require('fs'),
    pg = require('pg'),
    conf = require('./conf'),
    models = require('./models');

pg.defaults.hideDeprecationWarnings = true;

/**
 * A noop function
 */

function noop() {}

/**
 * Retuns a list of sql files in the sql/`action` directory
 *
 * @param {String} action
 * @return {Array}
 */

function scripts(action) {
  var fullpath = path.resolve(__dirname, '..', 'sql', action);
  return fs.readdirSync(fullpath)
    .filter(function(file) {
      return path.extname(file) === '.sql';
    })
    .map(function(file) {
      return [fs.readFileSync(path.join(fullpath, file)).toString(), file];
    });
}

/**
 * Drop/Create table with the schema found in the sql directory
 *
 * @param {Object} options
 */

function syncDB(options) {
  var uri = options.uri || conf.db,
      entries = (options.drop ? scripts('drop') : []).concat(scripts('create')),
      progress = options.progress || noop,
      complete = options.complete || noop;

  connect(uri, function(err, client, done) {
    //TODO Handle this properly
    if(err) throw err;
    run(client, done);
  });

  function run(client, done) {
    var entry = entries.shift();

    if(entry !== undefined) {
      var script = entry[0],
          path = entry[1];

      progress(script, path);
      client.query(script, function (err) {
        if(err) {
          complete(err);
          done(err);
        } else {
          run(client, done);
        }
      });
    } else {
      complete();
      done();
    }
  }

}
exports.syncDB = syncDB;

/**
 * Loads `filename` in the database
 *
 * @param {String} filename
 */

function load(filename) {

  return function(cb) {
    var file = path.join(process.cwd(), filename);
    var json = require(file);
    var model = exports[json.table];
    var rows = json.rows;
    console.log('Loading', file);

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
 * Connects to database at `uri`
 *
 * @param {String} uri
 * @param {Function} cb
 */

function connect(uri, cb) {
  pg.connect(uri, function(err, client, done) {
    // Backwards compatibility with pg
    if(typeof done === 'undefined') { done = noop; }
    if(err) {
      cb(err, null, done);
    } else {
      cb(null, client, done);
    }
  });
}
exports.connect = connect;

/**
 * Returns a pg client, you can either specify a connection uri
 * or let the function use `conf.db`
 *
 * ### Example:
 *
 * ```js
 * getClient('tcp://anon@acme.com', function(err, client, done) {});
 * ```
 *
 * ```js
 * getClient(function(err, client, done) {});
 * ```
 *
 * @param {*} uri
 * @param {Function} cb
 */

function getClient(uri, cb) {
  if(typeof uri === 'function') {
    cb = uri;
    uri = conf.db;
  }
  connect(uri, function(err, client, done) {
    if(err) {
      cb(err, null, done);
    } else {
      cb(null, client, done);
    }
  });
}
exports.getClient = getClient;

/**
 * Expose models
 */

Object.keys(models).forEach(function(key) {
  exports[key] = models[key];
});