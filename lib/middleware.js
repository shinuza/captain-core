var fs = require('fs');
var path = require('path');
var util = require('./util');
var format = require('util').format;

var errors = require('./errors');
var onError = require('./util').onError;
var sessions = require('./resources/sessions');
var settings = require('./settings');

const HARVESTING_TIMEOUT = 5 * 1000;

function authenticate() {
  var maxAge = settings.get('SESSION_MAXAGE');
  setInterval(function() {
    var d = new Date();
    sessions.all(function(sessions) {
      sessions.forEach(function(session) {
        if((d - session.createdAt) > maxAge) {
          session.destroy();
        }
      });
    }, function() {
      console.log(arguments)
    });

  }, HARVESTING_TIMEOUT);

  return function(req, res, next) {
    req.session = null;
    if(!req.cookies.token) {
      next();
    } else {
      sessions.findByToken(req.cookies.token, function(token) {
        if(token) {
          token.getUser().success(function(user) {
            req.session = {
              user: user
            };
            next();
          }).error(onError(res));
        } else {
          res.clearCookie('token');
          next();
        }
      }, onError(res));
    }
  };
}
exports.authenticate = authenticate;

function notFound() {
  return function(req, res){
    res.status(404);

    if (req.accepts('html')) {
      res.send('<h1>Not found</h1>');
      return;
    }

    if (req.accepts('json')) {
      res.json(errors.notFound);
      return;
    }

    res.type('txt').send('Not found');
  };
}
exports.notFound = notFound;

function templates(options) {
  var id, templates, content,
      ext = '.html',
      tmplDir = path.join(settings.get('TEMPLATE_DIR'), 'includes'),
      files = util.dig(tmplDir, ext);

  options = options || {};

  return function(req, res, next) {
    if(!templates || options.cache === false) {
      templates = files.map(function(file) {
        content = fs.readFileSync(file);
        id = path.basename(file).replace(ext, '');
        return format('<script type="text/html" data-id="%s">%s</script>', id, content);
      });
    }

    res.locals.templates = templates;
    next();
  }
}
exports.templates = templates;