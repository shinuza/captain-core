var settings = require('../settings');
var helpers = require('./helpers');

var Sequelize = require("sequelize");
var sequelize = new Sequelize(settings.DATABASE['NAME'], settings.DATABASE['USER'], settings.DATABASE['PASSWORD'], {
  host: settings.DATABASE['HOST'],
  port: settings.DATABASE['PORT'],
  dialect: settings.DATABASE['ENGINE'],
  storage: settings.DATABASE['NAME'],
  logging: false
});

function logging(b) {
  sequelize.options.logging = !!b === true ? console.log : false;
}
exports.logging = logging;

var Post = exports.Post = sequelize.define('Post', {
  title: { type: Sequelize.STRING, allowNull: false },
  slug: { type: Sequelize.STRING, allowNull: false, unique: true},
  description: { type: Sequelize.TEXT, allowNull: false },
  body:  { type: Sequelize.TEXT, allowNull: false }
});

var User = exports.User = sequelize.define('User', {
  username: { type: Sequelize.STRING, allowNull: false, unique: true },
  password: { type: Sequelize.STRING, allowNull: false}
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

if(!module.parent) {
  logging(true);
  new Sequelize.Utils.QueryChainer()
    .add(Post.sync({force: true}))
    .add(User.sync({force: true}))
    .add(Tag.sync({force: true}))
    .add(Token.sync({force: true}))
    .run()
    .success(function() {console.log('OK'); logging(false)})
    .error(function(errors) {console.log(errors)});
}