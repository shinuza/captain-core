#!/usr/bin/env node
var program = require('commander');

var models = require('./models');
var users = require('./resources/users');

program
  .version('0.0.1')
  .option('createuser', 'Creates a user account')
  .option('syncdb', 'Synchronise all definitions')
  .option('-f, --force', 'Force operation')
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

if(program.syncdb) {
  function syncAll(forceDrop) {
    models.syncAll(forceDrop, function(err) {
      if(err) console.log(err);
      else process.exit();
    });
  }
  if(program.force) {
    syncAll(true);
  } else {
    program.prompt('Force drop? (y/n): ', function(answer) {
      var forceDrop = !!answer.match(/y|yes/);
      syncAll(forceDrop);
    });
  }
}