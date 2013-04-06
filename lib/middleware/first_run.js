"use strict";

var fs = require('fs'),
  resolve = require('path').resolve,
  _ = require('underscore'),

  db = require('../db.js'),
  conf = require('../conf');


module.exports = function firstRun() {
  return function(req, res, next) {
    if(req.url == '/') {
      db.posts.count(function(err, nb) {
        if(err) { return next(err); }
        if(nb === 0) {
          var html = fs.readFileSync(resolve(__dirname, '..', 'first_run.html')).toString(),
            tmpl = _.template(html);

          res.send(tmpl(conf));
        } else {
          next();
        }
      });
    } else {
      next();
    }
  }
};