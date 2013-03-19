var fs = require('fs'),
    path = require('path');

var swig = require('swig');

var cwd = process.cwd(),
    signals = require('../signals'),
    db = require('../db'),
    settings = require('../settings.js'),
    util = require('../util.js');
//TODO REFACTOR ME :(

swig.init({
  filters: require('../filters'),
  allowErrors: false,
  cache: true
});

function writeFile(fn) {
  var tmpl = swig.compileFile(getTemplateFile());

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
      fs.writeFile(getOutputFile(), content, fn);
    }
  });
}

signals.on('post:create', writeFile);
signals.on('post:update', writeFile);

function getOutputFile() {
  return path.join(cwd, 'cache', 'feed.xml');
}

function getTemplateFile() {
  return path.join(cwd, 'assets', 'syndication.html');
}

exports.index = function index(req, res, next) {
  var output = getOutputFile();

  if(!fs.existsSync(output)) {
    writeFile(function(err) {
      if(err) {
        next(err);
        util.logger.error('Failed to write `' + output +'`', err);
      } else {
        res.sendfile();
        util.logger.info('Wrote `' + output +'`');
      }
    });
  }
};
