App.MenuView = Backbone.View.extend({

  el: '#menu',

  unselectAll: function unselectAll() {
    this.$el.find('a').each(function(i, link) {
      $(link).removeClass('active');
    });
  },

  select: function select(hash) {
    this.unselectAll();
    this.$el.find('a[href="#' + hash + '"]').addClass('active');
  }

});

App.UserView = Backbone.View.extend({

  el: '#userbox',

  initialize: function initialize() {
    this.$img = this.$el.find('.img');
    this.$name = this.$el.find('.name');

    this.listenTo(this.model, 'change:imageUrl', this.renderImage);
    this.listenTo(this.model, 'change:username', this.renderName);
    this.listenTo(this.model, 'error', this.onError);
    this.listenTo(this.model, 'destroy', this.onDestroy);
  },

  renderImage: function renderImage(model, value) {
    var background = value ? 'url(' + value +')' : '';
    this.$img.css('background', background);
  },

  renderName: function renderName(model, value) {
    this.$name.html(value || 'Anonymous');
  },

  onError: function() {
    App.router.navigate('login', {trigger: true});
  },

  onDestroy: function() {
    var l = document.location;
    l.href = l.host + l.pathname;
  }

});