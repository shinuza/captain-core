var util = require('../util'),
   conf = require('../conf/conf');

function create_update(req, res, next) {
  conf.set(req.body);
  var error = conf.save();

  if(error) next(error);
  else res.json(201, conf.toJSON());
}
exports.create = exports.update = util.loginRequired(create_update);

function show(req, res) {
  res.json(conf.toJSON());
}
exports.show = util.loginRequired(show);