/**
 * Abort with the given `str` and `err`.
 *
 * @param {String} str
 * @param {Error} err
 */
function abort(str, err) {
  console.error(red(str));
  if(err) console.log(err);
  process.exit(1);
}
exports.abort = abort;

/**
 * Exit gracefully with the given `str`.
 *
 * @param {String} str
 */
function exit(str) {
  console.log(cyan(str));
  process.exit(0);
}
exports.exit = exit;

/**
 * Returns the `str` with red markers.
 *
 * @param {String} str
 */
function red(str) {
  return '\x1b[31m' + str + '\x1b[0m';
}
exports.red = red;

/**
 * Returns the `str` with yellow markers.
 *
 * @param {String} str
 */
function yellow(str) {
  return '\x1b[33m' + str + '\x1b[0m';
}
exports.yellow = yellow;

/**
 * Returns the `str` with cyan markers.
 *
 * @param {String} str
 */
function cyan(str) {
  return '\x1b[36m' + str + '\x1b[0m';
}
exports.cyan = cyan;