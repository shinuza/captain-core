var helpers = require('./helpers');
var models = require('./models'),
    Post = models.Post,
    logging = models.logging,
    onError = helpers.onError;


function countBySlug(slug, success, error) {
  Post.count({where: {slug: slug}}).success(success).error(error);
}
exports.countBySlug = countBySlug;

function findBySlug(slug, success, error) {
  Post.find({where: {slug: slug}}).success(success).error(error);
}
exports.findBySlug = findBySlug;

// Resources
exports.create = function index(req, res) {
  var body = req.body;
  body.slug = helpers.slugify(body.title);

  countBySlug(body.slug, function(count) {
    if(count > 0) {
      res.json(409, {"error": "A post with that slug already exists"});
    } else {
      Post.create(body)
        .success(function(){
          res.json(201, {ok: true});
        })
        .error(onError(res));
    }
  }, onError(res));
};

exports.update = function update(req, res) {
  var body = req.body;

  findBySlug(req.params.post, function(post) {
    if(post === null) {
      res.json(404, {"error": "Not found"})
    } else {
      post.updateAttributes(body).success(function() {
        res.json(201, {ok: true});
      }).error(onError(res));
    }
  }, onError(res));
};

exports.index = function show(req, res) {
  Post.all({limit: req.query.limit, offset: req.query.offset})
    .success(res.json.bind(res))
    .error(onError(res));
};


exports.show = function show(req, res) {
  findBySlug(req.params.post, function(post) {
    if(post === null) {
      res.json(404, {"error": "Not found"})
    } else {
      res.json(post);
    }
  }, onError(res));
};

exports.destroy = function update(req, res) {
  findBySlug(req.params.post, function(post) {
    if(post === null) {
      res.json(404, {"error": "Not found"});
    } else {
      post.destroy().success(function() {
        res.send(204);
      }).error(onError(res));
    }
  }, onError(res));
};

// Associations

exports.user = {
  associate: function(req, res) {

  },

  show: function(req, res) {

  }

};

exports.tags = {
  associate: function(req, res) {

  },

  list: function(req, res) {

  }
};