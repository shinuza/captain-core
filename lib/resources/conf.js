var util = require('../util'),
   settings = require('../settings');

function create_update(req, res, next) {
  settings.set(req.body);
  var error = settings.save();

  if(error) next(error);
  else res.json(201, settings.toJSON());
}
exports.create = exports.update = util.loginRequired(create_update);

function show(req, res) {
  res.json(settings.toJSON());
}
exports.show = util.loginRequired(show);