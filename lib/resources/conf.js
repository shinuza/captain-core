var util = require('../util'),
   conf = require('../conf/');

/**
 * URL: /conf/[:conf]
 *
 * Methods: POST, PUT
 *
 * Status codes:
 *
 *  * `500` Server error
 *
 */

function create_update(req, res, next) {
  res.send(500);
}
exports.create = exports.update = util.loginRequired(create_update);

/**
 * URL: /conf/:conf
 *
 * Method: GET
 *
 * Status codes:
 *
 *  * `200` ok
 *
 */

function show(req, res) {
  res.json(conf);
}
exports.show = util.loginRequired(show);