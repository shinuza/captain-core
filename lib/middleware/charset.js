"use strict";

/**
 * Sets charset to `code` on all requests
 * @param code
 * @returns {Function}
 */

module.exports = function charset(code) {
  return function(req, res, next) {
    res.charset = code;
    next();
  }
};