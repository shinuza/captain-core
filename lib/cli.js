#!/usr/bin/env node
var program = require('commander');
var db = require('riak-js').getClient();

var users = require('./users');

function createUser(username, password, cb) {
  db.save(users.USER_BUCKET, username, {
    username: username,
    password: users.encode(password)
  }, function(err) {
    if(err) return cb(err);
    cb();
  });
}
exports.createUser = createUser;

program
  .version('0.0.1')
  .option('createuser', 'Creates a user account')
  .parse(process.argv);
  
if(program.createuser) {
  program.prompt('username: ', function(username) {
    program.password('password: ', '*', function(password) {
      program.password('confirm password: ', '*', function(password2) {
        if(password != password2) return console.log('Password do not match, bailing out.');
        createUser(username, password, function(err) {
          if(err) console.log('Failed to created user' + err.toString());
          else console.log('User created!');  
        });
      });
    });
  });
}