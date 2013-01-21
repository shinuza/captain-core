App.Router = Backbone.Router.extend({

  routes: {
    "posts":          "posts:list",
    "posts/new" :     "posts:new",
    "posts/edit/:id": "posts:edit",

    "tags":           "tags:list",
    "tags/new":       "tags:new",
    "tags/edit/:id":  "tags:edit",

    "users":          "users:list",
    "users/new":      "users:new",
    "users/edit/:id": "users:edit",

    "login":          "login",
    "logout":         "logout",
    "dashboard":      "dashboard"
  },

  initialize: function initialize() {
    this.navigate('dashboard', {trigger: true});
  },

  'posts:list': function postsList() {
    App.postForm.unload();
    App.posts.fetch();
    App.region.setContent(App.postsView);
  },

  'posts:new': function postsNew() {
    App.postForm.unload();
    App.region.setContent(App.postForm);
  },

  'posts:edit': function postsEdit(id) {
    App.postForm.unload();
    App.postForm.load(id);
    App.region.setContent(App.postForm);
  },

  'tags:list': function tagsList() {
    App.tagForm.unload();
    App.tags.fetch();
    App.region.setContent(App.tagsView);
  },

  'tags:new': function tagsNew() {
    App.tagForm.unload();
    App.region.setContent(App.tagForm);
  },

  'tags:edit': function tagsEdit(id) {
    App.tagForm.unload();
    App.tagForm.load(id);
    App.region.setContent(App.tagForm);
  },

  'users:list': function usersList() {
    App.userForm.unload();
    App.users.fetch();
    App.region.setContent(App.usersView);
  },

  'users:new': function usersNew() {
    App.userForm.unload();
    App.region.setContent(App.userForm);
  },

  'users:edit': function usersEdit(id) {
    App.userForm.unload();
    App.userForm.load(id);
    App.region.setContent(App.userForm);
  },

  login: function login() {
    App.overlay.setContent(App.loginForm);
    App.overlay.show();
  },

  logout: function logout() {
    App.session.destroy();
    App.session.clear();
    App.router.navigate('dashboard', {trigger: true});
  },

  dashboard: function dashboard() {
    App.region.setContent('<h1>Dashboard</h1>');
  }

});