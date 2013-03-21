var util = require('../util'),
   conf = require('../conf/');

function create_update(req, res, next) {
  res.send(500);
}
exports.create = exports.update = util.loginRequired(create_update);

function show(req, res) {
  res.json(conf);
}
exports.show = util.loginRequired(show);