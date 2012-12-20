var settings = require('../settings');
var helpers = require('./helpers');

// Schema
var Schema = require('jugglingdb').Schema;
var schema = new Schema('redis', {port: 6379});

var Post = exports.Post = schema.define('Post', {
  created: {type: Date, default: Date.now},
  modified: {type: Date},
  title: String,
  slug: {type: String, index: true},
  content: Schema.Text
});

Post.beforeSave = function(next) {
  this.slug = helpers.slugify(this.title);
  if(this.id) {
    this.modified = new Date;
  }
  next();
};


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
  Post.all(function(err, posts) {
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