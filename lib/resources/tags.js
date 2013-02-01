var exceptions = require('../exceptions');
var util = require('../util');
var models = require('../models');
var signals = require('../signals');

var isArray = require('util').isArray;

// Resources
function create(req, res, next) {
  var body = req.body;
  body.slug = util.slugify(body.title);

  //TODO: Validation
  models.tags.findBySlug(body.slug, function(err, tag) {
    if(err) return next(err);

    if(tag) {
      res.json(tag);
    } else {
      models.tags.create(body, function(err, tag) {
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
exports.create = create//util.loginRequired(create);


function update(req, res, next) {
  var body = req.body;

  findById(req.params.tag, function(tag) {
    if(tag === null) {
      next(new exceptions.NotFound);
    } else {
      tag.updateAttributes(body).success(function() {
        res.json(201, body);
        signals.emit('tag:update', body);
      }).error(onError(res));
    }
  }, onError(res));
}
exports.update = util.loginRequired(update);

exports.index = function index(req, res) {
  var query = models.sequelize.query(
    'SELECT t.id, t.title, t.slug, count(pt.PostId) AS count FROM "Tags" t ' +
      'JOIN "PostsTags" pt ON pt.TagId = t.id ' +
      'GROUP BY t.id, t.title, t.slug'
    , null, {raw: true});

  query.success(function(tags) {
    console.log(tags)
      res.format({
        'text/html': function() {
          res.render('tags/index', {tags: tags});
        },
        'application/json': function() {
          res.json(tags);
        }
      });
    })
    .error(onError(res));
};

function show(req, res, next) {
  findBySlug(req.params.tag, function(post) {
    if(post === null) {
      next(new exceptions.NotFound);
    } else {
      res.json(post);
    }
  }, onError(res));
}
exports.show = util.loginRequired(show);

function destroy(req, res, next) {
  findById(req.params.tag, function(tag) {
    if(tag === null) {
      next(new exceptions.NotFound);
    } else {
      tag.destroy().success(function() {
        res.send(204);
        signals.emit('tag:destroy', req.params.tag);
      }).error(onError(res));
    }
  }, onError(res));
}
exports.destroy = util.loginRequired(destroy);

// Associations

function getPosts(req, res, next) {
  findBySlug(req.params.tag, function(tag) {
    if(tag === null) {
      next(new exceptions.NotFound);
    } else {
      tag.getPosts().success(function(posts) {
        res.format({
          'text/html': function() {
            res.render('tags/show', {posts: posts, tag: tag});
          },
          'application/json': function() {
            res.json(posts);
          }
        });
      }).error(onError(res));
    }
  }, onError(res));
}

exports.posts = {
  'get': getPosts
};