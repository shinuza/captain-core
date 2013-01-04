var util = require('util');

var helpers = require('./helpers');
var models = require('./models'),
  Tag = models.Tag,
  Post = models.Post,
  logging = models.logging,
  onError = helpers.onError;


function countBySlug(slug, success, error) {
  Tag.count({where: {slug: slug}}).success(success).error(error);
}
exports.countBySlug = countBySlug;

function findBySlug(slug, success, error) {
  Tag.find({where: {slug: slug}}).success(success).error(error);
}
exports.findBySlug = findBySlug;

// Resources
exports.create = function index(req, res) {
  var body = req.body;
  body.slug = helpers.slugify(body.title);

  countBySlug(body.slug, function(count) {
    if(count > 0) {
      res.json(409, {"error": "A tag with that slug already exists"});
    } else {
      Tag.create(body)
        .success(function(){
          res.json(201, {ok: true});
        })
        .error(onError(res));
    }
  }, onError(res));
};

exports.update = function update(req, res) {
  var body = req.body;

  findBySlug(req.params.tag, function(tag) {
    if(tag === null) {
      res.json(404, {"error": "Not found"})
    } else {
      tag.updateAttributes(body).success(function() {
        res.json(201, {ok: true});
      }).error(onError(res));
    }
  }, onError(res));
};

exports.index = function show(req, res) {
  Tag.all({limit: req.query.limit, offset: req.query.offset})
    .success(res.json.bind(res))
    .error(onError(res));
};


exports.show = function show(req, res) {
  findBySlug(req.params.tag, function(post) {
    if(post === null) {
      res.json(404, {"error": "Not found"})
    } else {
      res.json(post);
    }
  }, onError(res));
};

exports.destroy = function update(req, res) {
  findBySlug(req.params.tag, function(tag) {
    if(tag === null) {
      res.json(404, {"error": "Not found"});
    } else {
      tag.destroy().success(function() {
        res.send(204);
      }).error(onError(res));
    }
  }, onError(res));
};


// Associations

exports.posts = {
  associate: function(req, res) {
    if(!util.isArray(req.body)) {
      res.json(400, {"error": "Bad request"})
    } else {
      findBySlug(req.params.tag, function(tag) {
        if(tag === null) {
          res.json(404, {"error": "Not found"});
        } else {
          var ids = helpers.pluck(req.body, 'id');
          Post.findAll({where: {id: ids}}).success(function(posts) {
            tag.setPosts(posts).success(function() {
              res.json(201, {ok: true});
            }).error(onError(res));
          }).error(onError(res));
        }
      }, onError(res));
    }
  },

  list: function(req, res) {
    findBySlug(req.params.tag, function(tag) {
      tag.getPosts().success(function(posts) {
        res.json(posts);
      }).error(onError(res));
    }, onError(res));
  }
};