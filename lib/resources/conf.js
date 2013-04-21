"use strict";

var util = require('../util');


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
  res.send(501);
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
  res.json(501);
}
exports.show = util.loginRequired(show);