var db = require('riak-js').getClient()

var delete_keys = function(key) {
  db.remove('users', key);
}

db.keys('users', { keys: 'stream' }).on('keys', delete_keys).start()