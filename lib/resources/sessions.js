var crypto = require('crypto');

var stampify = require('../util/date.js').stampify,
    conf = require('../conf'),
    db = require('../db.js');

/**
 * URL: /sessions/:post
 *
 * Method: GET
 *
 * Status codes:
 *
 *  * `200` ok
 *
 */

exports.show = function show(req, res, next) {
  db.tokens.findUserFromToken(req.cookies.token, function(err, user) {
    if(err) return next(err);
    res.json(user);
  });
};

/**
 * URL: /sessions/
 *
 * Method: POST
 *
 * Status codes:
 *
 *  * `200` ok
 *  * `403` authentication failed
 *
 */

exports.create = exports.update = function createOrUpdate(req, res, next) {
  var token,
      body = req.body;

  db.users.findByCredentials(body.username, body.password, function(err, user) {
    if(err) return next(err);

    crypto.randomBytes(32, function(err, buffer) {
      if (err) return next(err);
      token = buffer.toString('hex');

        db.tokens.create({token: token, user_id: user.id}, function(err) {
          var maxAge = stampify(conf.session_maxage);
          if(err) return next(err);
          res.cookie('token', token,  { maxAge: maxAge, httpOnly: true });
          res.send(201, user);
      });
    });
  });
};

/**
 * URL: /sessions/:session
 *
 * Method: DELETE
 *
 * Status codes:
 *
 *  * `200` ok
 *  * `404` not found
 *
 */

exports.destroy = function destroy(req, res, next) {
  db.tokens.del(req.cookies.token, function(err) {
    if(err) return next(err);
    res.json(null);
  });
};
