var fs = require('fs'),
    path = require('path');

var cwd = process.cwd(),
    signals = require('../signals'),
    db = require('../db'),
    conf = require('../conf'),
    templates = require('../templates.js');


function writeFile(fn) {
  var tmpl = templates.swig.compileFile(getTemplateFile());

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
      console.error(new Date);
      console.error(err.stack);
    } else {
      var content = tmpl.render({
        updated: new Date(),
        rows: r.rows,
        conf: conf
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
  return path.join(conf.themes_root, 'syndication.html');
}

/**
 * URL: /feed/
 *
 * Method: GET
 *
 * Status codes:
 *
 *  * `200` ok
 *
 */

exports.index = function index(req, res, next) {
  var output = getOutputFile();

  if(!fs.existsSync(output)) {
    writeFile(function(err) {
      if(err) {
        next(err);
        console.error(new Date);
        console.error(err.stack);
      } else {
        res.sendfile();
        console.log(new Date);
        console.info('[INFO]: Wrote feed cache file at ', output);
      }
    });
  }
};
