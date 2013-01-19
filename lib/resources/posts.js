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
  var options = {limit: req.query.limit, offset: req.query.offset};
  if(!req.session) {
    options.where = { published: true };
  }
  // Trying to display all posts when not logged in
  if(!options.where && !util.isStaff(req)) {
    return res.json(403, errors.permissionRequired);
  }

  Post.findAll(options)
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

function setUser(req, res) {
  findById(req.params.post, function(post) {
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

function getUser(req, res) {
  findById(req.params.post, function(post) {
    if(post === null) {
      res.json(404, errors.notFound);
    } else {
      post.getUser().success(function(user) {
        res.json(user)
      }).error(onError(res));
    }
  }, onError(res));
}

function getTags(req, res) {
  findById(req.params.post, function(post) {
    if(post === null) {
      res.json(404, errors.notFound);
    } else {
      post.getTags().success(function(tags) {
        res.json(tags);
      }).error(onError(res));
    }
  }, onError(res));
}

function setTags(req, res) {
  findById(req.params.post, function(post) {
    if(post === null) {
      res.json(404, errors.notFound);
    } else {
      if(!util.isArray(req.body)) {
        res.json(400, errors.badRequest);
      } else {
        var ids = util.pluck(req.body, 'id');
        Tag.findAll({where: { id: ids }}).success(function(tags) {
          post.setTags(tags).success(function() {
            res.json(201, {ok: true});
          }).error(onError(res));
        }).error(onError(res));
      }
    }
  }, onError(res));
}

exports.user = {
  'set': util.loginRequired(setUser),
  'get': util.loginRequired(getUser)
};

exports.tags = {
  'get': util.loginRequired(getTags),
  'set': util.loginRequired(setTags)
};