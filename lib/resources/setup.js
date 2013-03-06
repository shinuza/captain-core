var path = require('path');

var util = require('../util'),
    defaults = require('../defaults.js'),
    settings = require('../settings');

function createOrUpdate(req, res, next) {
  var body = req.body;
  settings.set(body);
  settings.save(function(err) {
    if(err) return next(err);
    res.json(201, settings);
  });
}
exports.create = exports.update = util.loginRequired(createOrUpdate);

function show(req, res) {
  res.json(settings.toJSON());
}
exports.show = util.loginRequired(show);

function index(req, res) {
  res.sendfile(path.join(defaults.PROJECT_ROOT, 'assets', 'setup.html'));
}
exports.index = index;