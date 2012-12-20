var settings = require('../settings');

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
  this.slug = slugify(this.title);
  if(this.id) {
    this.modified = new Date;
  }
  next();
};

// Functions
function slugify(str) {
  str = str.toLowerCase().replace(/\s+/g,'-');
  var tr = {
    //A
    '\u00e0': 'a',
    '\u00e1': 'a',
    '\u00e2': 'a',
    '\u0003': 'a',
    '\u00e4': 'a',
    '\u00e5': 'a',

    '\u00e6':'ae',
    '\u00e7':'c',
    '\u00fc':'ue',
    '\u00f6':'oe',
    '\u00df':'ss',
    //E
    '\u00e8':'e',
    '\u00e9':'e',
    '\u00ea':'e',
    '\u00eb':'e',
    '/':'-'
  };

  for(var key in tr) {
    if(tr.hasOwnProperty(key)) {
      str = str.replace(new RegExp(key, 'g'), tr[key]);
    }
  }

  str = str.replace(/[^a-zA-Z0-9\-]/g,'');
  str = str.replace(/-+/g, '-');
  return str;
}
exports.slugify = slugify;

function findBySlug(slug, cb) {
  Post.findOne({where: {'slug': slug}}, cb);
}
exports.findBySlug = findBySlug;


// Resources
exports.create = function index(req, res, next) {
  var body = req.body;
  //TODO: Enhance this
  body.slug = slugify(body.title);

  findBySlug(body.slug, function(err, post) {
    if (err) return next(err);

    if(post) {
      res.json(409, {"error": "A post with that slug already exists"});
    } else {
      new Post(body).save(function(err) {
        if (err) return next(err);
        res.json(201, {ok: true});
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
        if (err) return next(err);
        res.json(201, {ok: true});
      });
    }
  });
};

exports.index = function show(req, res, next) {
  Post.all(function(err, posts) {
    if(err) return next(err);
    res.json(posts);
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
        if (err) return next(err);
        res.send(204);
      });
    }
  });
};