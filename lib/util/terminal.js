/**
 * Abort with the given `str` and `err`.
 *
 * @param {String} str
 * @param {Error} err
 */

exports.abort = function abort(str, err) {
  console.error(exports.red(str));
  if(err) console.log(err);
  process.exit(1);
};

/**
 * Exit gracefully with the given `str`.
 *
 * @param {String} str
 */

exports.exit = function exit(str) {
  console.log(exports.cyan(str));
  process.exit(0);
};

/**
 * Returns the `str` with red markers.
 *
 * @param {String} str
 */

exports.red = function red(str) {
  return '\x1b[31m' + str + '\x1b[0m';
};

/**
 * Returns the `str` with yellow markers.
 *
 * @param {String} str
 */

exports.yellow = function yellow(str) {
  return '\x1b[33m' + str + '\x1b[0m';
};

/**
 * Returns the `str` with cyan markers.
 *
 * @param {String} str
 */

exports.cyan = function cyan(str) {
  return '\x1b[36m' + str + '\x1b[0m';
};