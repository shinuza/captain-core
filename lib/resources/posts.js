var util = require('../util'),
    db = require('../db'),
    signals = require('../signals');


// Resources
function create(req, res, next) {
  var body = req.body;
  body.user_id = req.session.user.id;

  db.posts.create(req.body, function(err, post) {
    if(err) return next(err);

    res.json(201, post);
    signals.emit('post:create', post);
  });
}
exports.create = util.loginRequired(create);

function update(req, res, next) {
  var body = req.body;

  db.posts.update(req.params.post, body, function(err, post) {
    if(err) return next(err);

    res.json(201, post);
    signals.emit('post:update', post);
  });
}
exports.update = util.loginRequired(update);

exports.index = function index(req, res) {
  var links = {}, context = {};
  var next, prev;
  var link = req.url + '?page=';
  var query = req.xhr ? db.posts.all : db.posts.allPublished;
  var page = req.query.page ? parseInt(req.query.page, 10) : 1;


  query(page, function(err, result) {
    next = result.count - (result.limit + result.offset) > 0;
    prev = page > 1;

    if(next) links.next = link + (page + 1);
    if(prev) links.prev = link + (page - 1);

    context = {
      links: links,
      page: page,
      count: result.count,
      posts: result.rows,
      next: next,
      prev: prev
    };

    res.links(links);
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

exports.show = function show(req, res, next) {
  db.posts.find(req.params.post, function(err, post) {
    if(err) return next(err);

    res.format({
      'text/html': function() {
        res.render('posts/show', {post: post});
      },
      'application/json': function() {
        res.json(post);
      }
    });
  });
};

function destroy(req, res, next) {
  db.posts.del(req.params.post, function(err) {
    if(err) return next(err);

    res.send(204);
    signals.emit('post:destroy', req.params.post);
  });
}
exports.destroy = util.loginRequired(destroy);

function count(req, res, next) {
  db.posts.count(function(err, count) {
    if(err) return next(err);

    res.json({count: count});
  });
}
exports.count = count;

function countPublished(req, res, next) {
  db.posts.countPublished(function(err, count) {
    if(err) return next(err);

    res.json({count: count});
  });
}
exports.countPublished = countPublished;


// Associations

function getTags(req, res, next) {
  db.posts.find(req.params.post, function(err, post) {
    if(err) return next(err);

    db.posts_tags.postGetTags(post.id, function(err, tags) {
      if(err) return next(err);
      res.json(tags);
    });
  });
}

function setTags(req, res, next) {
  db.posts_tags.postSetTags(req.params.post, req.body, function(err, affected) {
    if(err) return next(err);
    res.json(201, {count: affected});
  });
}

exports.tags = {
  'get': getTags,
  'set': util.loginRequired(setTags)
};