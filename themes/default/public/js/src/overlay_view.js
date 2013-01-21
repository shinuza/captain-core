App.Overlay = Backbone.View.extend({

  el: '#overlay',

  initialize: function initialize() {
    this.$shade = $('#shade');

    this.onResized();
    $(window).on('resize', this.onResized.bind(this));
  },

  setContent: function(view) {
    this.$el.empty().append(view.$el);
    this.onResized();
  },

  onResized: function onResized() {
    var height = window.innerHeight;
    var width = window.innerWidth;
    this.$el.css({
      left: width / 2 - this.$el.width() / 2,
      top: height / 2 - this.$el.height() / 2
    });
  },

  show: function() {
    this.$el.removeClass('hidden');
    this.$shade.removeClass('hidden');
  },

  hide: function() {
    this.$el.addClass('hidden');
    this.$shade.addClass('hidden');
  }

});