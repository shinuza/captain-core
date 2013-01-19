var errors = require('../errors');
var util = require('../util');
var models = require('../models');

var Tag = models.Tag,
    Post = models.Post,
    logging = models.logging,
    onError = util.onError,
    isArray = require('util').isArray;


function countBySlug(slug, success, error) {
  Tag.count({where: {slug: slug}}).success(success).error(error);
}
exports.countBySlug = countBySlug;

function findBySlug(slug, success, error) {
  Tag.find({where: {slug: slug}}).success(success).error(error);
}
exports.findBySlug = findBySlug;

function findById(id, success, error) {
  Tag.find(id).success(success).error(error);
}
exports.findById = findById;

// Resources
function create(req, res) {
  var body = req.body;
  body.slug = util.slugify(body.title);

  countBySlug(body.slug, function(count) {
    if(count > 0) {
      res.json(409, errors.alreadyExists);
    } else {
      Tag.create(body)
        .success(function(tag){
          res.json(201, tag);
        })
        .error(onError(res));
    }
  }, onError(res));
}
exports.create = util.loginRequired(create);

function update(req, res) {
  var body = req.body;

  findById(req.params.tag, function(tag) {
    if(tag === null) {
      res.json(404, errors.notFound)
    } else {
      tag.updateAttributes(body).success(function() {
        res.json(201, {ok: true});
      }).error(onError(res));
    }
  }, onError(res));
}
exports.update = util.loginRequired(update);

exports.index = function index(req, res) {
  Tag.all({limit: req.query.limit, offset: req.query.offset})
    .success(res.json.bind(res))
    .error(onError(res));
};

exports.show = function show(req, res) {
  findBySlug(req.params.tag, function(post) {
    if(post === null) {
      res.json(404, errors.notFound)
    } else {
      res.json(post);
    }
  }, onError(res));
};

function destroy(req, res) {
  findById(req.params.tag, function(tag) {
    if(tag === null) {
      res.json(404, errors.notFound);
    } else {
      tag.destroy().success(function() {
        res.send(204);
      }).error(onError(res));
    }
  }, onError(res));
}
exports.destroy = util.loginRequired(destroy);

// Associations

function getPosts(req, res) {
  findBySlug(req.params.tag, function(tag) {
    tag.getPosts().success(function(posts) {
      res.json(posts);
    }).error(onError(res));
  }, onError(res));
}

exports.posts = {
  'get': util.loginRequired(getPosts)
};