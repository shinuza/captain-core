var db = require('riak-js').getClient()

function remove(buckets) {
  buckets.forEach(function(bucket) {
    var deleteKeys = function(key) {
      db.remove(bucket, key);
    }
    db.keys(bucket, { keys: 'stream' }).on('keys', deleteKeys).start();
  })
}

remove(['users', 'posts']);