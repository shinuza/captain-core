var fs = require('fs');
var path = require('path');

var swig = require('swig');

var signals = require('../signals'),
    db = require('../db'),
    filters = require('../filters'),
    settings = require('../settings.js');

swig.init({ filters: filters});
var tmpl = swig.compileFile(path.resolve(__dirname, '../../templates/atom.swig'));
var feedPath = path.resolve(path.dirname(process.mainModule.filename), 'cache/feed.xml');

function error(err) {
  console.log(err);
}

function success(posts) {
  getUsers(posts, function(result) {
    var content = tmpl.render({
      updated: new Date(),
      posts: result,
      settings: settings.toJSON()
    });
    fs.writeFileSync(feedPath, content);
  });
}

//TODO: Remove this
function getUsers(posts, fn) {
  var i = 0;
  var todo = posts.length;
  var done = 0;
  var results = [];
  for(; i < todo; i++) {

    (function(post, j){
      post.getUser()
      .success(function(user) {
        done++;
        post.author = user;
        results[j] = post;
        if(done === todo) {
          fn(results);
        }
      })
      .error(function(err) {
        fn(err);
      });
    })(posts[i], i);

  }
}

function dumpFile() {
  return
  var options = {
    order: 'id DESC',
    where: { published: true }
  };

  Post.findAll(options)
    .success(success)
    .error(error);
}

(function() {
  if(!fs.existsSync(feedPath)) {
    dumpFile();
  }
  signals.on('post:create', dumpFile);
}());

exports.index = function index(req, res) {
  res.sendfile(feedPath);
};
