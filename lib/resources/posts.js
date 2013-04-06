var _ = require('underscore');

var util = require('../util'),
    db = require('../db.js'),
    signals = require('../signals.js');


/**
 * URL: /posts/
 *
 * Method: POST
 *
 * Events:
 *
 *  * `post:create` (post)
 *
 * Status codes:
 *
 *  * `201` if post was created successfully
 *  * `409` if a post with the same `slug` already exists
 *
 */

function create(req, res, next) {
  var body = req.body;
  body.user_id = req.session.user.id;

  db.posts.create(req.body, function(err, post) {
    if(err) { return next(err); }

    res.json(201, post);
    signals.emit('post:create', post);
  });
}
exports.create = util.loginRequired(create);

/**
 * URL: /posts/:post
 *
 * Method: PUT
 *
 * Events:
 *
 *  * `post:update` (post)
 *
 * Status codes:
 *
 *  * `201` if post was created successfully
 *  * `409` if a post with the same `slug` already exists
 *
 */

function update(req, res, next) {
  var body = req.body;

  db.posts.update(req.params.post, body, function(err, post) {
    if(err) { return next(err); }

    res.json(201, post);
    signals.emit('post:update', post);
  });
}
exports.update = util.loginRequired(update);

/**
 * Lists posts with pagination support
 *
 * URL: /posts/
 *
 * Method: GET
 *
 * Template: /posts/index
 *
 * Status codes:
 *
 *  * `200` ok
 *
 */

exports.index = function index(req, res, next) {
  var links = {}, context = {};
  var nextPage, prevPage, page;
  var link = req.url + '?page=';
  var query = req.xhr && req.session ? db.posts.all : db.posts.allPublished;

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
      posts: result.rows,
      next: nextPage,
      prev: prevPage
    };

    res.format({
      'text/html': function() {
        res.render('posts/index', context);
      },
      'application/json': function() {
        res.json(context);
      }
    });
  });
};

/**
 * URL: /posts/:post
 *
 * Method: GET
 *
 * Template: /posts/show
 *
 * Status codes:
 *
 *  * `200` ok
 *  * `404` not found
 *
 */

exports.show = function show(req, res, next) {
  db.posts.find(req.params.post, function(err, post) {
    if(err) { return next(err); }

    db.posts_tags.postGetTags(post.id, function(err, tags) {
      if(err) { return next(err); }
      res.format({
        'text/html': function() {
          res.render('posts/show', {post: post, tags: tags});
        },
        'application/json': function() {
          res.json(post);
        }
      });
    });
  });
};

/**
 * URL: /posts/:post
 *
 * Method: DELETE
 *
 * Events:
 *
 *  * `post:destroy`
 *
 * Status codes:
 *
 *  * `200` ok
 *  * `404` not found
 *
 */

function destroy(req, res, next) {
  db.posts.del(req.params.post, function(err) {
    if(err) { return next(err); }
    res.json(null);
    signals.emit('post:destroy', req.params.post);
  });
}
exports.destroy = util.loginRequired(destroy);

/**
 * URL: /posts/count
 *
 * Method: GET
 *
 * Status codes:
 *
 *  * `200` ok
 *
 */

function count(req, res, next) {
  db.posts.count(function(err, count) {
    if(err) { return next(err); }
    res.json({count: count});
  });
}
exports.count = count;

/**
 * URL: /posts/count_published
 *
 * Method: GET
 *
 * Status codes:
 *
 *  * `200` ok
 *
 */

function countPublished(req, res, next) {
  db.posts.countPublished(function(err, count) {
    if(err) { return next(err); }
    res.json({count: count});
  });
}
exports.countPublished = countPublished;

/**
 * URL: /posts/archive/
 *
 * Method: GET
 *
 * Template: /posts/archive
 *
 * Status codes:
 *
 *  * `200` ok
 *
 */

function archive(req, res, next) {
  var years;

  db.posts.archive(function(err, posts) {
    if(err) { return next(err); }

    years = _.groupBy(posts, function(post) {
      return post.created_at.getFullYear();
    });

    res.format({
      'text/html': function() {
        res.render('posts/archive', {years: years});
      },
      'application/json': function() {
        res.json(years);
      }
    });
  });
}
exports.archive = archive;


// Associations
//TODO: Refactor this
function getTags(req, res, next) {
  db.posts.find(req.params.post, function(err, post) {
    if(err) { return next(err); }

    db.posts_tags.postGetTags(post.id, function(err, tags) {
      if(err) { return next(err); }
      res.json(tags);
    });
  });
}

function setTags(req, res, next) {
  db.posts_tags.postSetTags(req.params.post, req.body, function(err, affected) {
    if(err) { return next(err); }
    res.json(201, {count: affected});
  });
}

exports.tags = {
  'get': getTags,
  'set': util.loginRequired(setTags)
};