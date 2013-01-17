var errors = require('../errors');
var util = require('../util');
var models = require('../models');

var Tag = models.Tag,
    Post = models.Post,
    logging = models.logging,
    onError = util.onError;


function countBySlug(slug, success, error) {
  Post.count({where: {slug: slug}}).success(success).error(error);
}
exports.countBySlug = countBySlug;

function findBySlug(slug, success, error) {
  Post.find({where: {slug: slug}}).success(success).error(error);
}
exports.findBySlug = findBySlug;

function findById(id, success, error) {
  Post.find(id).success(success).error(error);
}
exports.findBySlug = findBySlug;

// Resources
function create(req, res) {
  var body = req.body;
  body.slug = util.slugify(body.title);

  countBySlug(body.slug, function(count) {
    if(count > 0) {
      res.json(409, errors.alreadyExists);
    } else {
      Post.create(body)
        .success(function(post) {
          res.json(201, post);
        })
        .error(onError(res));
    }
  }, onError(res));
}
exports.create = util.loginRequired(create);

function update(req, res) {
  var body = req.body;

  findById(req.params.post, function(post) {
    if(post === null) {
      res.json(404, errors.notFound);
    } else {
      post.updateAttributes(body).success(function() {
        res.json(201, {ok: true});
      }).error(onError(res));
    }
  }, onError(res));
}
exports.update = util.loginRequired(update);

exports.index = function index(req, res) {
  Post.all({limit: req.query.limit, offset: req.query.offset})
    .success(res.json.bind(res))
    .error(onError(res));
};


exports.show = function show(req, res) {
  findBySlug(req.params.post, function(post) {
    if(post === null) {
      res.json(404, errors.notFound);
    } else {
      res.json(post);
    }
  }, onError(res));
};

function destroy(req, res) {
  findById(req.params.post, function(post) {
    if(post === null) {
      res.json(404, errors.notFound);
    } else {
      post.destroy().success(function() {
        res.send(204);
      }).error(onError(res));
    }
  }, onError(res));
}
exports.destroy = util.loginRequired(destroy);

// Associations

function associateUser(req, res) {
  findBySlug(req.params.post, function(post) {
    if(post === null) {
      res.json(404, errors.notFound);
    } else {
      if(!req.body.id) {
        res.json(400, errors.badRequest);
      } else {
        post.setUser(req.body).success(function() {
          res.json(201, {ok: true});
        }).error(onError(res));
      }
    }
  }, onError(res));
}

function showUser(req, res) {
  findBySlug(req.params.post, function(post) {
    if(post === null) {
      res.json(404, errors.notFound);
    } else {
      post.getUser().success(function(user) {
        res.json(user)
      }).error(onError(res));
    }
  }, onError(res));
}

function associateTags(req, res) {
  if(!util.isArray(req.body)) {
    res.json(400, errors.badRequest);
  } else {
    findBySlug(req.params.post, function(post) {
      if(post === null) {
        res.json(404, errors.notFound);
      } else {
        var ids = util.pluck(req.body, 'id');
        Tag.findAll({where: {id: ids}}).success(function(tags) {
          post.setTags(tags).success(function() {
            res.json(201, {ok: true});
          }).error(onError(res));
        }).error(onError(res));
      }
    }, onError(res));
  }
}

function listTags(req, res) {
  findBySlug(req.params.post, function(post) {
    post.getTags().success(function(tags) {
      res.json(tags);
    }).error(onError(res));
  }, onError(res));
}

exports.user = {
  'associate': util.loginRequired(associateUser),
  'show': util.loginRequired(showUser)
};

exports.tags = {
  'associate': util.loginRequired(associateTags),
  'list': util.loginRequired(listTags)
};