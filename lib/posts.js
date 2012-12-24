var helpers = require('./helpers');
var Post = require('./models').Post;

// Functions
function findBySlug(slug, cb) {
  Post.findOne({where: {'slug': slug}}, cb);
}
exports.findBySlug = findBySlug;


// Resources
exports.create = function index(req, res, next) {
  var body = req.body;
  body.slug = helpers.slugify(body.title);

  findBySlug(body.slug, function(err, post) {
    if (err) return next(err);

    if(post) {
      res.json(409, {"error": "A post with that slug already exists"});
    } else {
      Post.create(body, function(err) {
        if (err) next(err);
        else res.json(201, {ok: true});
      });
    }
  });
};

exports.update = function update(req, res, next) {
  var body = req.body;
  body.modified = (new Date);

  findBySlug(req.params.post, function(err, post) {
    if (err) return next(err);

    if(post == undefined) {
      res.json(404, {"error": "Not found"})
    } else {
      post.updateAttributes(body, function(err) {
        if (err) next(err);
        else res.json(201, {ok: true});
      });
    }
  });
};

exports.index = function show(req, res, next) {
  Post.all({limit: req.query.limit, skip: req.query.skip}, function(err, posts) {
    if(err) next(err);
    else res.json(posts);
  });
};


exports.show = function show(req, res, next) {
  findBySlug(req.params.post, function(err, post) {
    if (err) return next(err);

    if(post == undefined) {
      res.json(404, {"error": "Not found"})
    } else {
      res.json(post);
    }
  });
};

exports.destroy = function update(req, res, next) {
  findBySlug(req.params.post, function(err, post) {
    if (err) { return next(err); }

    if(post == undefined) {
      res.json(404, {"error": "Not found"});
    } else {
      post.destroy(function(err) {
        if (err) next(err);
        else res.send(204);
      });
    }
  });
};