$(function() {
  App.users = new App.Users;
  App.posts = new App.Posts;
  App.tags = new App.Tags;
  App.session = new App.Session;

  App.region = new App.Region;
  App.overlay = new App.Overlay;
  App.router = new App.Router;

  // Router

  App.router.on('all', function routeAll(route) {
    var name = route.split(':')[1];
    if(name) {
      App.menuView.select(name);
    }
  });

  // Form

  App.loginForm = new App.FormView({
    name: 'login',
    model: App.session,
    fields: {
      username: {type: 'string', label: 'Username'},
      password: {type: 'string', label: 'Password', attributes: {'type': 'password'}}
    }
  });

  App.loginForm.on('success', function(){
    App.overlay.hide();
    App.router.navigate('dashboard', {trigger: true});
  });
  App.loginForm.construct();


  App.postForm = new App.FormView({
    name: 'posts',
    collection: App.posts,
    fields: {
      title: {type: 'string', label: 'Title'},
      body: {type: 'text', label: 'Body'},
      published: {type: 'boolean', label: 'Published'}
    }
  });

  App.postForm.on('render', function() {
    var $label = $('<div/>', {text:'Tags:'});
    var $ul = $('<ul/>', {'class': 'editable'});
    this.addWidget($label);
    this.addWidget($ul);

    this.editable = $($ul).editable();
  });

  App.postForm.on('unload', function() {
    this.editable.clear();
  });

  App.postForm.on('load', function(model) {
    $.getJSON('/posts/' + model.get('id') + '/tags', this.editable.load.bind(this.editable));
  });

  App.postForm.on('saved', function() {
    var data = this.editable.serialize();
    var unsaved = data.filter(function(tag) { return !tag.id; });
    var saved = 0;

    var onSave = (function(model) {
      this.editable.getElements().filter(function() {
          return $(this).text() === model.get('title');
        }).data('id', model.get('id'));
    }.bind(this));

    var done = (function() {
      var url = '/posts/' + this.model.get('id') + '/tags';
      var data = this.editable.serialize();
      //TODO Try to simplify this?
      $.ajax({
        url: url,
        data: JSON.stringify({data: data}),
        type: 'POST',
        contentType: 'application/json'
      });
    }.bind(this));

    if(unsaved.length) {
      unsaved.forEach(function(tag, index, tags) {
        var model = App.tags.create(tag);
        model.on('sync', function() {
          saved ++;
          onSave(model);
          if(saved === tags.length) {
            done();
          }
        });
      });
    } else {
      done();
    }
  });
  App.postForm.construct();

  App.userForm = new App.FormView({
    name: 'users',
    collection: App.users,
    fields: {
      username: {type: 'string', label: 'Username'},
      password: {type: 'string', label: 'Password', attributes: {'type': 'password'}},
      firstname: {type: 'string', label: 'First name'},
      lastname: {type: 'string', label: 'Last name'},
      email: {type: 'string', label: 'Email'},
      isStaff: {type: 'boolean', label: 'Is staff'}
    }
  });
  App.userForm.construct();

  App.tagForm = new App.FormView({
    name: 'tags',
    collection: App.tags,
    fields: {
      title: {type: 'string', label: 'Title'}
    }
  });
  App.tagForm.construct();


  // Views

  App.userView = new App.UserView({model: App.session});
  App.menuView = new App.MenuView;

  App.postsView = new App.ListView({
    collection: App.posts,
    name: 'posts',
    columns: [
      {'label': 'Title', 'value': 'title'},
      {'label': 'Created at', 'value': 'createdAt', 'type': 'date'},
      {'label': 'Published', 'value': 'published', 'type': 'bool'}
    ]
  });

  App.tagsView = new App.ListView({
    collection: App.tags,
    name: 'tags',
    columns: [
      {'label': 'Title', 'value': 'title'},
      {'label': 'Created at', 'value': 'createdAt', 'type': 'date'}
    ]
  });

  App.usersView = new App.ListView({
    collection: App.users,
    name: 'users',
    columns: [
      {'label': 'Username', 'value': 'username'},
      {'label': 'Created at', 'value': 'createdAt', 'type': 'date'},
      {'label': 'Is staff', 'value': 'isStaff', 'type': 'bool'}
    ]
  });
  Backbone.history.start();
  App.session.fetch();
});