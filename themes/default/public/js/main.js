var App = {};

$(function() {
  App.templates = {};

  App.Router = Backbone.Router.extend({

    routes: {
      "posts": "posts:index",
      "posts/:slug": "posts:show"
    },

    "posts:index": function() {
      $.getJSON('/posts', function(posts) {
        var tmpl = getTmpl('post');
        var html = '';

        posts.forEach(function(post) {
          html += tmpl({post: post});
        });

        App.region.setTitle();
        App.region.setContent(html);
      });
    },

    "posts:show": function(slug) {
      $.getJSON('/posts/' + slug, function(post) {
        var tmpl = getTmpl('post');
        var html = tmpl({post: post});
        App.region.setTitle(post.title);
        App.region.setContent(html);
      });
    }

  });

  App.Region = Backbone.View.extend({

    el: '#content',

    events: {
      'click .intercept': 'intercept'
    },

    initialize: function() {
      this.$title = $('#title');
      this._title = this.$title.text();
    },

    setTitle: function(title) {
      this.$title.text(title || this._title);
    },

    setContent: function(str) {
      this.$el.empty().html(str);
      window.scrollTo(0);
    },

    intercept: function(e) {
      var href = $(e.currentTarget).attr('href');
      App.router.navigate(href, {trigger: true});
      return false;
    }
  });

  App.router = new App.Router;
  App.region = new App.Region;

  Backbone.history.start({pushState: true, silent: true});
});
