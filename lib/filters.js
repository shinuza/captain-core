var marked = require('marked');


exports.markdown = function (input) {
  return marked(input.toString());
};