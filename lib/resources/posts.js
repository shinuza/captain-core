var _ = require('underscore');

var exceptions = require('../exceptions');
var util = require('../util');
var db = require('../db');
var settings = require('../settings');
var signals = require('../signals');

// Resources
function create(req, res, next) {
  var body = req.body;
  body.user_id = req.session.user.id;

  db.posts.create(req.body, function(err, post) {
    if(err) {
      if(err.code == 23505) {
        err = new exceptions.AlreadyExists();
      }
      next(err);
    } else {
      res.json(201, post);
      signals.emit('post:create', post);
    }
  });
}
exports.create = util.loginRequired(create);

function update(req, res, next) {
  var body = req.body;

  db.posts.update(req.params.post, body, function(err, post) {
    if(err) return next(err);
    if(!post) {
      next(new exceptions.NotFound());
    } else {
      res.json(201, post);
      signals.emit('post:update', post);
    }
  });
}
exports.update = util.loginRequired(update);

exports.index = function index(req, res) {
  var links = {};
  var next, prev;
  var link = req.url + '?page=';
  var query = req.session ? db.posts.all : db.posts.allPublished;
  var page = req.query.page ? parseInt(req.query.page, 10) : 1;


  query(page, function(err, result) {
    next = result.count - (result.limit + result.offset) > 0;
    prev = page > 1;

    if(next) links.next = link + (page + 1);
    if(prev) links.prev = link + (page - 1);

    res.links(links);
    res.format({
      'text/html': function() {
        res.render('posts/index', {
          links: links,
          page: page,
          count: result.count,
          posts: result.rows,
          next: next,
          prev: prev
        });
      },
      'application/json': function() {
        res.json(result.rows);
      }
    });
  });
};

exports.show = function show(req, res, next) {
  db.posts.find(req.params.post, function(err, post) {
    if(err) return next(err);

    if(_.size(post) === 0) {
      next(new exceptions.NotFound);
    } else {
      res.format({
        'text/html': function() {
          res.render('posts/show', {post: post});
        },
        'application/json': function() {
          res.json(post);
        }
      });
    }
  });
};

function destroy(req, res, next) {
  db.posts.del(req.params.post, function(err, deleted) {
    if(err) return next(err);
    if(deleted === 0) {
      next(new exceptions.NotFound());
    } else {
      res.send(204);
      signals.emit('post:destroy', req.params.post);
    }
  });
}
exports.destroy = util.loginRequired(destroy);

// Associations

function getTags(req, res, next) {
  db.posts.find(req.params.post, function(err, post) {
    if(err) return next(err);
    if(_.size(post) === 0) {
      next(new exceptions.NotFound());
    } else {
      db.posts_tags.postGetTags(post.id, function(err, tags) {
        if(err) return next(err);
        res.json(tags);
      });
    }
  });
}

function setTags(req, res, next) {
  db.posts_tags.postSetTags(req.params.post, req.body.data, function(err, affected) {
    if(err) return next(err);
    res.json(201, {count: affected});
  });
}

exports.tags = {
  'get': getTags,
  'set': util.loginRequired(setTags)
};