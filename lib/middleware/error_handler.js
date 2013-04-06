"use strict";

var conf = require('../conf');

/**
 * Custom error handler that handles exceptions properly
 *
 * @returns {Function}
 */

module.exports = function errorHandler() {
  return function(err, req, res, next) {
    var debug = conf.env !== 'production';

    if(!err.statusCode) {
      if(!debug) {
        err.message = 'Oups! An unexpected error occurred...';
      } else {
        console.error(new Date);
        console.error(err.stack);
      }
      err.statusCode = 500;
    }

    res.status(err.statusCode);
    res.format({
      'text/html': function() {
        res.render('error', {
          statusCode: err.statusCode,
          stack: err.stack || '',
          message: err.view && debug ?
            err.message + '\n' + JSON.stringify(err.view, null, 4) :
            err.message
        });
      },
      'application/json': function() {
        res.json({
          message: err.message,
          statusCode: err.status || err.statusCode
        });
      },
      'text/plain': function() {
        res.type('txt').send(err.message);
      }
    })
  };
};