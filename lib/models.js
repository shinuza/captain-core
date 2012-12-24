var settings = require('../settings');
var helpers = require('./helpers');

var Schema = require('jugglingdb').Schema;
var schema = exports.schema = new Schema(settings.ENGINE, settings.ENGINE_OPTIONS);


// Post
var Post = exports.Post = schema.define('Post', {
  created: {type: Date, default: Date.now},
  modified: {type: Date},
  title: String,
  slug: {type: String, index: true},
  content: Schema.Text
});

Post.beforeCreate = function beforeCreate(next) {
  if(this.id) {
    this.modified = new Date;
  } else {
    this.slug = helpers.slugify(this.title);
  }
  next();
};

// User
var User = exports.User = schema.define('User', {
  username: {type: String, index: true},
  password: String,
  joined: {type: Date, default: Date.now},
  token: {type: Schema.Text, index: true}
});

// Relationships
User.hasMany(Post, {as: 'posts',  foreignKey: 'userId'});
Post.belongsTo(User, {as: 'author', foreignKey: 'userId'});
