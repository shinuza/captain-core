var exceptions = require('../exceptions');
var signals = require('../signals');
var util = require('../util');

function create(req, res, next) {

}
exports.create = util.loginRequired(create);

  function show(req, res, next) {

}
exports.show = util.loginRequired(show);