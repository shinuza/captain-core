"use strict";

var util = require('../util')
  , db = require('../db');


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
    if(err) { return next(err); }
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
    if(err) { return next(err); }
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

function index(req, res, next) {
  var links = {};
  var nextPage, prevPage, page;
  var link = req.url + '?page=';

  db.users.all({page: req.query.page, limit: req.query.limit}, function(err, result) {
    if(err) { return next(err); }

    page = result.page;
    nextPage = result.count - (result.limit + result.offset) > 0;
    prevPage = page > 1;

    if(nextPage) links.next = link + (page + 1);
    if(prevPage) links.prev = link + (page - 1);
    if(Object.keys(links).length) res.links(links);

    res.json({
      links: links,
      page: page,
      count: result.count,
      users: result.rows,
      next: nextPage,
      prev: prevPage
    });

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
    if(err) { return next(err); }
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
    if(err) { return next(err); }
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
    if(err) { return next(err); }
    res.json({count: count});
  });
}
exports.count = count;