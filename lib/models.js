var settings = require('../settings');
var helpers = require('./util');

var Sequelize = require("sequelize");
var sequelize = exports.sequelize = new Sequelize(settings.DATABASE['NAME'], settings.DATABASE['USER'], settings.DATABASE['PASSWORD'], {
  host: settings.DATABASE['HOST'],
  port: settings.DATABASE['PORT'],
  dialect: settings.DATABASE['ENGINE'],
  storage: settings.DATABASE['NAME'],
  logging: false
});

// Functions

function logging(b) {
  if(b === undefined) {
    return sequelize.options.logging;
  } else {
    sequelize.options.logging = !!b === true ? console.log : false;
  }
}
exports.logging = logging;

function syncAll(forceDrop, cb) {
  var log = logging();
  logging(true);
  sequelize.sync({force: forceDrop})
  .success(function() {
    logging(log); cb(null);
  })
  .error(function(errors) {cb(errors)});
}
exports.syncAll = syncAll;

// Models

var Post = exports.Post = sequelize.define('Post', {
  title: { type: Sequelize.STRING, allowNull: false },
  slug: { type: Sequelize.STRING, allowNull: false, unique: true},
  body: { type: Sequelize.TEXT, allowNull: false },
  published: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false}
});

var User = exports.User = sequelize.define('User', {
  username: { type: Sequelize.STRING, allowNull: false, unique: true },
  password: { type: Sequelize.STRING, allowNull: false},
  firstname: Sequelize.STRING,
  lastname: Sequelize.STRING,
  email: Sequelize.STRING,
  imageUrl: Sequelize.STRING,
  isStaff: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false},
  lastLogin: {type: Sequelize.DATE, allowNull: true}
});

var Tag = exports.Tag = sequelize.define('Tag', {
  title: { type: Sequelize.STRING, allowNull: false},
  slug: { type: Sequelize.STRING, allowNull: false, unique: true}
});

var Token = exports.Token = sequelize.define('Token', {
  token: { type: Sequelize.STRING, allowNull: false, unique: true}
});

Token.belongsTo(User);
User.hasOne(Token);
User.hasMany(Post);
Post.belongsTo(User);
Post.hasMany(Tag);
Tag.hasMany(Post);