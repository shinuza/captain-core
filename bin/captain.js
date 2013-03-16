#!/usr/bin/env node
var fs = require('fs'),
    os = require('os'),
    path = require('path');

var program = require('commander'),
    async = require('async'),
    ncp = require('ncp');

var pkg = require('../package.json'),
    db = require('./../lib/db'),
    util = require('../lib/util');

const PROJECT_ROOT = path.resolve(__dirname, '..');

program
  .version(pkg.version)
  .option('createuser', 'Creates a user account')
  .option('syncdb', 'Synchronise all definitions')
  .option('loaddata [filename]', 'Loads data')
  .option('themes', 'Display available themes')
  .option('theme [theme]', 'Install theme')
  .option('init [projectname]', 'Creates a new project')
  .option('-f, --force', 'Force operation')
  .parse(process.argv);

/**
 * Returns str preceded by four spaces
 *
 * @param str
 */

function pad(str) {
  return '    ' + str;
}

/**
 * echo str > path.
 *
 * @param {String} path
 * @param {String} str
 */

function write(path, str) {
  fs.writeFileSync(path, str);
  console.log(util.cyan(pad('create : ')) + path);
}

/**
 * Mkdir.
 *
 * @param {String} path
 */

function mkdir(path) {
  if(!fs.existsSync(path)) {
    fs.mkdirSync(path, 0755);
    console.log(util.cyan(pad('create : ')) + path);
  } else {
    console.log(util.yellow(pad('dir exists : ')) + path);
  }
}

/**
 *
 * Creates on dir at `base`, and x `subs` under it.
 *
 * @param {String} base
 * @param {Array} subs
 */

function dirs(base, subs) {
  mkdir(base);
  subs.forEach(function(sub) {
    mkdir(path.join(base, sub));
  });
}

/**
 * Install `theme` in `process.cwd()`
 *
 * @param theme
 */

function installTheme(theme, fn) {
  theme = path.join(PROJECT_ROOT, 'themes', theme);

  if(fs.existsSync(theme)) {
    ncp(theme, path.join(process.cwd(), 'themes'), fn);
  } else {
    util.abort('Theme not found');
  }
}

/**
 * Copy `asset` to `./assets/asset`
 *
 * @param asset
 */

function copyAsset(root, asset) {
  var out = path.join('assets', asset),
      target = path.join(PROJECT_ROOT, out),
      p = path.join(process.cwd(), root, out);

  fs.writeFileSync(p, fs.readFileSync(target));
  console.log(util.cyan(pad('create : ')) + path.join(root, out));
}

/**
 * Test if `path` is empty.
 *
 * @param {String} path
 * @returns {Boolean}
 */

function isEmptyDirectory(path) {
  var files;
  try {
    files = fs.readdirSync(path);
    if(files.length > 0) {
      return false;
    }
  } catch(err) {
    if(err.code) {
      util.abort('Error: ', err);
    } else {
      throw e;
    }
  }
  return true;
}

/**
 * Synchronize database.
 *
 * @param {Boolean} forceDrop
 */

function syncDB(forceDrop) {
  db.syncDB({
    oncomplete: function(err) {
      if(err) {
        util.abort('Failed syncing', err);
      } else {
        util.exit('\nAll done\n\n');
      }
    },

    onprogress: function(script) {
      console.log('Running: \n========\n%s\n', script);
    },

    forceDrop: forceDrop
  });
}

// Templates

function files(name) {
  var index = [
      'var express = require(\'express\');'
    , 'var app = express();'
    , ''
    , 'var core = require(\'captain-core\');'
    , 'var admin = require(\'captain-admin\');'
    , 'var settings = core.modules.settings;'
    , ''
    , 'app.use(\'/admin\', admin);'
    , 'app.use(core);'
    , 'app.listen(settings.get(\'PORT\'), settings.get(\'HOST\'));'
    , ''
    , 'console.log(\'Running at http://%s:%d\', settings.get(\'HOST\'), settings.get(\'PORT\'));'
  ].join(os.EOL);


  var pkg = [
      '{'
    , '  "name": "' + name + '",'
    , '  "description": "",'
    , '  "version": "0.0.1",'
    , '  "private": true,'
    , '  "dependencies": {'
    , '    "express": "*",'
    , '    "captain-admin": "*",'
    , '    "captain-core": "*"'
    , '  },'
    , '  "scripts": {'
    , '    "start": "node index.js"'
    , '   }'
    , '}'
  ].join(os.EOL);

  return {
    'index.js': index,
    'package.json': pkg,
    'README.md': '## ' + name
  };
}

// Handlers
//TODO: Use IIFE
if(program.createuser) {
  program.prompt('username: ', function(username) {
    program.password('password: ', '*', function(password) {
      program.password('confirm password: ', '*', function(password2) {
        if(password != password2) {
          return util.abort('Password do not match, bailing out.');
        }
        program.prompt('email: ', function(email) {
          var body = {username: username, password: password, isStaff: true, email: email};

          db.users.create(body, function(err) {
            if(err) {
              util.abort('Failed to created user', err);
            } else {
              util.exit('\nUser created!\n\n');
            }
          });
        });
      });
    });
  });
}

else if(program.syncdb) {
  if(program.force) {
    syncDB(true);
  } else {
    program.prompt('Force drop? (y/n): ', function(answer) {
      var forceDrop = !!answer.match(/y|yes|arrr/);
      syncDB(forceDrop);
    });
  }
}

else if(program.loaddata) {
  (function() {
    var files = [];
    var filename = program.loaddata;
    var stats = fs.statSync(filename);

    if(stats.isDirectory()) {
      fs.readdirSync(filename).forEach(function(file) {
        files.push(path.join(filename, file));
      });
    } else {
      files.push(filename);
    }

    files = files.map(function(file) {
      return db.load(file);
    });

    async.series(files, function(err){
      if(err) {
        util.abort('Failed loading data', err);
      } else {
        util.exit('\nAll done.\n\n');
      }
    });
  }());
}

else if(program.init) {
  var target = program.init;

  function initProject(name) {
    console.log();
    console.log(util.cyan('Creating project: ') + name);
    console.log();

    // Creating dirs
    dirs(name, ['assets', 'cache', 'media', 'logs']);

    // Creating files
    var templates = files(name);
    Object.keys(templates).forEach(function(key) {
      var p = path.join(name, key);
      write(p, templates[key]);
    });

    copyAsset(name, 'syndication.html');
    installTheme('default', function(err) {
      if(err) {
        util.abort(err);
      } else {
        console.log();
        console.log(util.cyan('Installed theme: '), 'default');
      }

      // Instructions
      console.log();
      console.log(util.cyan('Now run: '));
      console.log(pad('cd ' + target));
      console.log(pad('npm install'));
      console.log(pad('npm start'));
    });
  }

  if(target === true) {
    program.help();
  }

  if(fs.existsSync(target) && !isEmptyDirectory(target) && !program.force) {
    program.prompt('Directory not empty, force create? (y/n): ', function(answer) {
      var forceCreate = !!answer.match(/y|yes|arrr/);

      if(forceCreate) {
        initProject(target);
      } else {
        util.abort('Cowardly refusing to init project in a non-empty directory');
      }
    });
  } else {
    initProject(target);
  }
}

else if(program.themes) {
  (function() {
    var themes = fs.readdirSync(path.join(PROJECT_ROOT, 'assets', 'themes'));

    console.log(util.cyan('Available themes:'));
    console.log(themes.map(pad).join(os.EOL));
  })();
}

else if(program.theme) {
  (function(target) {
    if(target === true) { program.help(); }

    try {
      var pkg = require(path.join(process.cwd(), '/package.json'));

      if(Object.keys(pkg.dependencies).indexOf('captain-core') !== -1) {
        installTheme(target);
      } else {
        util.abort('Not a Captain project, aborting');
      }
    } catch(e) {
      console.log(e);
      if(e.code === 'MODULE_NOT_FOUND') {
        util.abort('Captain project not found');
      }
    }
  })(program.theme);
}

else {
  program.help();
}