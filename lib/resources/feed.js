"use strict";

var fs = require('fs')
  , path = require('path')
  , cwd = process.cwd()
  , db = require('../db.js')
  , conf = require('../conf')
  , signals = require('../signals.js')
  , templates = require('../templates.js');

var query =
  "SELECT p.title, p.uuid, p.slug, p.created_at, p.updated_at, p.summary, p.body," +
    "u.first_name, u.last_name, u.email " +
    "FROM posts p " +
    "JOIN users u ON u.id = p.user_id " +
    "WHERE p.published = true " +
    "ORDER BY p.created_at DESC ";

var output = path.join(cwd, 'cache', 'feed.xml');

/**
 * Deletes cached feed.xml
 */

function flush() {
  if(exists(output)) {
    fs.unlinkSync(output);
  }
}

/**
 * Checks if `p` exists
 *
 * @param p
 */
var exists = fs.existsSync || path.existsSync;


/**
 * URL: /feed/
 *
 * Method: GET
 *
 * Status codes:
 *
 *  * `200` ok
 *
 */

exports.index = function index(req, res, next) {
  res.type('application/atom+xml');

  if(!exists(output)) {
    db.getClient(function(err, client, done) {
      client.query(query, function(err, r) {
        if(err) {
          next(err);
          done(err);
        } else {
          res.render('feed', { updated: new Date(), rows: r.rows }, function(err, xml) {
            if(err) {
              next(err);
              done(err);
            } else {
              fs.writeFileSync(output, xml);
              res.end(xml);
              done();
            }
          });
        }
      });
    });
  } else {
    res.sendfile(output);
  }
};

signals.on('post:create', flush);
signals.on('post:update', flush);

