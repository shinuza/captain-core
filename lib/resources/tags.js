"use strict";

var util = require('../util')
  , string = require('../util/string.js')
  , db = require('../db')
  , signals = require('../signals.js');


/**
 * URL: /tags/:tag
 *
 * Method: POST
 *
 * Events:
 *
 *  * `tag:create` (tag)
 *
 * Status codes:
 *
 *  * `201` if tag was created successfully
 *  * `409` if a tag with the same `slug` already exists
 *
 */
function create(req, res, next) {
  var body = req.body,
      slug = string.slugify(body.title);

  db.tags.findBySlug(slug, function(err, tag) {
    if(err && err.statusCode != 404) { return next(err); }

    if(tag) {
      res.json(201, tag);
    } else {
      db.tags.create(req.body, function(err, tag) {
        if(err) {
          next(err);
        } else {
          res.json(201, tag);
          signals.emit('tag:create', tag);
        }
      });
    }
  });
}
exports.create = util.loginRequired(create);

/**
 * URL: /tags/:tag
 *
 * Method: PUT
 *
 * Events:
 *
 *  * `tag:update` (tag)
 *
 * Status codes:
 *
 *  * `201` if tag was created successfully
 *  * `409` if a tag with the same `slug` already exists
 *
 */

function update(req, res, next) {
  var body = req.body;

  db.tags.update(req.params.tag, body, function(err, tag) {
    if(err) { return next(err); }

    res.json(201, tag);
    signals.emit('tag:update', tag);
  });
}
exports.update = util.loginRequired(update);

/**
 * URL: /tags/
 *
 * Method: GET
 *
 * Template: /tags/index
 *
 * Status codes:
 *
 *  * `200` ok
 *
 */

exports.index = function index(req, res, next) {
  var links = {}, context = {}, page;
  var nextPage, prevPage;
  var link = req.url + '?page=';
  var query = req.xhr && req.session ? db.tags.all : db.tags.allWithPosts;

  query({page: req.query.page, limit: req.query.limit}, function(err, result) {
    if(err) { return next(err); }

    page = result.page;
    nextPage = result.count - (result.limit + result.offset) > 0;
    prevPage = page > 1;

    if(nextPage) links.next = link + (page + 1);
    if(prevPage) links.prev = link + (page - 1);
    if(Object.keys(links).length) res.links(links);

    context = {
      links: links,
      page: page,
      count: result.count,
      tags: result.rows,
      next: nextPage,
      prev: prevPage
    };

    res.format({
      'text/html': function() {
        res.render('tags/index', context);
      },
      'application/json': function() {
        res.json(context);
      }
    });
  });
};

/**
 * URL: /tags/:tag
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
  db.tags.find(req.params.tag, function(err, tag) {
    if(err) { return next(err); }
    res.json(tag);
  });
}
exports.show = util.loginRequired(show);

/**
 * URL: /tags/:tag
 *
 * Method: DELETE
 *
 * Events:
 *
 *  * `tag:destroy`
 *
 * Status codes:
 *
 *  * `200` ok
 *  * `404` not found
 *
 */

function destroy(req, res, next) {
  db.tags.del(req.params.tag, function(err) {
    if(err) { return next(err); }
    res.json(null);
    signals.emit('tag:destroy', req.params.tag);
  });
}
exports.destroy = util.loginRequired(destroy);

/**
 * URL: /tags/count
 *
 * Method: GET
 *
 * Status codes:
 *
 *  * `200` ok
 *
 */

function count(req, res,next) {
  db.tags.count(function(err, count) {
    if(err) { return next(err); }
    res.json({count: count});
  });
}
exports.count = count;


/**
 * URL: /tags/:tag
 *
 * Method: GET
 *
 * Template: /tags/show
 *
 * Status codes:
 *
 *  * `404` not found
 *  * `200` ok
 *
 */

function getPosts(req, res, next) {
  db.tags.find(req.params.tag, function(err, tag) {
    if(err) { return next(err); }

    db.posts_tags.tagGetPosts(tag.id, function(err, posts) {
      if(err) { return next(err); }
      res.format({
        'text/html': function() {
          res.render('tags/show', {posts: posts, tag: tag});
        },
        'application/json': function() {
          res.json(posts);
        }
      });
    });
  });
}

exports.posts = {
  'get': getPosts
};