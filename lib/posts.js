var db = require('riak-js').getClient();

var settings = require('../settings');
var BUCKET = 'posts';

exports.create = function index(req, res, next) {
  var body = req.body;
  //TODO: Enhance this
  body.slug = body.title.toLowerCase().replace(' ', '-');

  db.exists(BUCKET, body.slug, function(err, exist) {
    if (err) { return next(err); }
    if(exist === true) {
      res.json(409, {"error": "A post with that slug already exists"});
    } else {
        db.save(BUCKET, body.slug, body, function(err) {
            if (err) { return next(err); }
            res.json(201, {ok: true});
        });
    }
  });
};

exports.update = function update(req, res, next) {
  var body = req.body;
  body.modified = (new Date);

  db.exists(BUCKET, req.params.post, function(err, exist) {
    if (err) { return next(err); }
    if(exist === false) {
      res.json(404, {"error": "Not found"})
    } else {
        db.save(BUCKET, req.params.post, body, function(err) {
            if (err) { return next(err); }
            res.json(201, {ok: true});
        });
    }
  });
};

exports.index = function show(req, res, next) {
  db.getAll(BUCKET, function(err, post) {
    if(err) return next(err);
    res.json(post);
  });
};


exports.show = function show(req, res, next) {
  db.get(BUCKET, req.params.post, function(err, post) {
    if(err) return next(err);
    res.json(post);
  });
};

exports.destroy = function update(req, res, next) {
  db.remove(BUCKET, req.params.post, function(err) {
    if (err) { return next(err); }
    res.json(204);
  });
};