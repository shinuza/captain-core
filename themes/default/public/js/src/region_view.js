App.Region = Backbone.View.extend({

  el: '#main',

  initialize: function initialize() {
    this.onResized();
    $(window).on('resize', this.onResized.bind(this));
  },

  getHeight: function() {
    var inner = window.innerHeight;
    var doc = document.height;
    return inner < doc ? inner : doc;
  },

  onResized: function onResized() {
    this.$el.css('min-height',this.getHeight());
  },

  setContent: function(view) {
    this.$el.empty();
    if(typeof view === 'string') {
      this.$el.html(view);
    } else {
      this.$el.append(view.$el);
      this.onResized();
      view.trigger('display', view);
    }
  }
});