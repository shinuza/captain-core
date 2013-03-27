var util = require('../util'),
    db = require('../db');


/**
 * URL: /users/
 *
 * Method: POST
 *
 * Status codes:
 *
 *  * `201` if user was created successfully
 *  * `409` if a user with the same `username` already exists
 *
 */

function create(req, res, next) {
  var body = req.body;

  db.users.create(body, function(err, user) {
    if(err) return next(err);
    res.json(201, user);
  });
}
exports.create = util.loginRequired(create);

/**
 * URL: /users/:user
 *
 * Method: PUT
 *
 * Status codes:
 *
 *  * `201` if the user was updated successfully
 *
 */

function update(req, res, next) {
  var body = req.body;
  delete body.username;

  db.users.update(req.params.user, body, function(err, user) {
    if(err) return next(err);
    res.json(201, user);
  });
}
exports.update = util.loginRequired(update);

/**
 * URL: /users/
 *
 * Method: GET
 *
 * Status codes:
 *
 *  * `200` ok
 *
 */

function index(req, res) {
  db.users.all(function(err, users) {
    if(err) return next(err);
    res.json(users);
  });
}
exports.index = util.loginRequired(index);

/**
 * URL: /users/:user
 *
 * Method: GET
 *
 * Status codes:
 *
 *  * `200` ok
 *  * `404` not found
 *
 */

function show(req, res, next) {
  db.users.find(req.params.user, function(err, user) {
    if(err) return next(err);
    res.json(user);
  });
}
exports.show = util.loginRequired(show);

/**
 * URL: /users/:user
 *
 * Method: DELETE
 *
 * Status codes:
 *
 *  * `200` ok
 *  * `404` not found
 *
 */

function destroy(req, res, next) {
  db.users.del(req.params.user, function(err) {
    if(err) return next(err);
    res.json(null);
  });
}
exports.destroy = util.loginRequired(destroy);

/**
 * URL: /users/count
 *
 * Method: GET
 *
 * Status codes:
 *
 *  * `200` ok
 *
 */

function count(req, res, next) {
  db.users.count(function(err, count) {
    if(err) return next(err);
    res.json({count: count});
  });
}
exports.count = count;