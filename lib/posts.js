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
      return res.json(409, {"error": "A post with that slug already exists"});
    }
    db.save(BUCKET, body.slug, body, function(err) {
      if (err) { return next(err); }
      res.json(201, {ok: true});
    });
  });
};