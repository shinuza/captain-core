var db = require('riak-js').getClient()


function remove(bucket) {
  var delete_keys = function(key) {
    db.remove(bucket, key);
  }

  db.keys(bucket, { keys: 'stream' }).on('keys', delete_keys).start()
}

remove('users');
remove('posts');