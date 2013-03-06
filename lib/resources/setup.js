var util = require('../util'),
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
  res.render('setup');
}
exports.index = index;