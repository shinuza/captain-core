var path = require('path'),
    fs = require('fs'),
    pg = require('pg'),
    conf = require('./conf'),
    models = require('./models');

pg.defaults.hideDeprecationWarnings = true;

function noop() {}

/**
 * Retuns a list of sql files in the sql/`action` directory
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
 * @param {Object} options
 */

function syncDB(options) {
  var uri = options.uri || conf.db;
  var entries = (options.drop ? scripts('drop') : []).concat(scripts('create'));

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

      options.onprogress(script, path);
      client.query(script, function (err) {
        if(err) {
          options.oncomplete(err);
          done();
        } else {
          run(client, done);
        }
      });
    } else {
      done();
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
 * Connects database at `db`
 * @param uri
 * @param cb
 */

function connect(uri, cb) {
  pg.connect(uri, function(err, client, done) {
    if(err) { return cb(err); }
    // Backwards compatibility with pg
    if(typeof done === 'undefined') { done = noop; }
    cb(null, client, done);
  });
}
exports.connect = connect;

/**
 * Executes the statement `sql` with `args`
 */

function getClient(cb) {
  connect(conf.db, function(err, client, done) {
    if(err) {
      console.error(new Date);
      console.error(err.stack);
      done();
      return cb(err);
    } else {
      cb(null, client, done);
    }
  });
}
exports.getClient = getClient;

Object.keys(models).forEach(function(key) {
  exports[key] = models[key];
});