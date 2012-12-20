#!/usr/bin/env node
var program = require('commander');
var users = require('./users');

function createUser(username, password, cb) {
  var user = new users.User({'username': username, 'password': users.encode(password)});
  user.save(function(err) {
    if(err) {
      cb(err);
    } else {
      cb();
    }
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