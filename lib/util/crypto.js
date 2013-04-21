"use strict";

var crypto = require('crypto')
  , node_uuid = require('node-uuid')
  , conf = require('../conf');


function uuid(type) {
  return node_uuid[type || 'v4']();
}
exports.uuid = uuid;

/**
 * Passes an encoded version of `password` to `cb` or and error
 *
 * @param password
 * @param cb
 */

function encode(password, cb) {
  var secret_key = conf.secret_key
    , iterations = conf.pbkdf2_iterations
    , keylen = conf.pbkdf2_keylen;

  crypto.pbkdf2(password, secret_key, iterations, keylen, function(err, derivedKey) {
    var str;

    if(err) {
      cb(err);
    } else {
      str = new Buffer(derivedKey).toString('base64');
      cb(null, str);
    }
  });
}
exports.encode = encode;