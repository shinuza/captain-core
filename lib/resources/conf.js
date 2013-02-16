var util = require('../util');
var settings = require('../settings');

function createOrUpdate(req, res) {
  var body = req.body;
  settings.set(body);
  res.json(201, settings.toJSON());
}
exports.create = exports.update = util.loginRequired(createOrUpdate);

function show(req, res) {
  res.json(settings.toJSON());
}
exports.show = util.loginRequired(show);