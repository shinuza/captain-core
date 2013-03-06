var fs = require('fs'),
    path = require('path');

var swig = require('swig');

var signals = require('../signals'),
    db = require('../db'),
    settings = require('../settings.js'),
    util = require('../util.js');


var debug = settings.get('DEBUG');
swig.init({
  filters: require('../filters'),
  allowErrors: debug,
  cache: !debug
});

var tmpl = swig.compileFile(path.join(settings.get('PROJECT_ROOT'), 'assets', 'atom.html')),
  feedPath = path.join(settings.get('APP_ROOT'), 'cache', 'feed.xml');

function writeFile() {
  var q =
    "SELECT " +
      "p.title," +
      "p.uuid," +
      "p.slug," +
      "p.created_at," +
      "p.updated_at," +
      "p.summary," +
      "p.body," +
      "u.first_name," +
      "u.last_name," +
      "u.email " +
    "FROM posts p " +
    "JOIN users u ON u.id = p.user_id " +
    "WHERE p.published = true " +
    "ORDER BY p.created_at DESC ";

  db.query(q, function(err, r) {
    if(err) {
      util.logger.error(err.message,  err);
    } else {
      var content = tmpl.render({
        updated: new Date(),
        rows: r.rows,
        settings: settings.toJSON()
      });
      fs.writeFile(feedPath, content, function(err) {
        if(err) {
          util.logger.error('Failed to write `' + feedPath +'`', err);
        } else {
          util.logger.info('Wrote `' + feedPath +'`');
        }
      });
    }
  });
}

(function() {
  if(!fs.existsSync(feedPath)) {
    writeFile();
  }
  signals.on('post:create', writeFile);
}());

exports.index = function index(req, res) {
  res.sendfile(feedPath);
};
