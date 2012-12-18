var db = require('riak-js').getClient();
var users = require('./users');

function createuser(username, password, cb) {
  db.save(users.USER_BUCKET, username, {
    username: username,
    password: users.encode(password)
  }, function(err) {
    if(err) return cb(err);
    cb();
  });
}
exports.createuser = createuser;