var fs = require('fs'),
    path = require('path');

var swig = require('swig');

var signals = require('../signals'),
    db = require('../db'),
    settings = require('../settings.js');


swig.init({ filters: require('../filters')});

var tmpl = swig.compileFile(path.resolve(__dirname, '../../templates/atom.swig')),
    feedPath = path.resolve(path.dirname(process.mainModule.filename), 'cache/feed.xml');

function writeFile() {
  var q =
    "SELECT " +
      "p.title, p.uuid, p.slug, p.created_at, p.updated_at, p.summary, p.body, u.first_name, u.last_name, u.email " +
    "FROM posts p " +
    "JOIN users u ON u.id = p.user_id " +
    "WHERE p.published = true " +
    "ORDER BY p.created_at DESC ";

  db.query(q, function(err, r) {
    if(err) {
      console.log(err);
    } else {
      var content = tmpl.render({
        updated: new Date(),
        rows: r.rows,
        settings: settings.toJSON()
      });
      fs.writeFileSync(feedPath, content);
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
