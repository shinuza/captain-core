App.ListView = Backbone.View.extend({

  all: false,

  tagName: 'div',

  templateName: 'list',

  events: {
    'click .edit': 'onClick',
    'click .delete': 'onDelete',
    'click .all': 'onAll',
    'click .quick-check': 'onQuickCheck'
  },

  initialize: function initialize(options) {
    this.name = options.name;
    this.columns = options.columns;
    this.collection = options.collection;
    this.tmpl = getTmpl(this.templateName);

    this.collection.on('destroy', function (model) {
      var view = this.get(model.id);
      if(view) {
        view.remove();
      } else {
        console.error('View for model %d not found', model.id);
      }
    }.bind(this));

    this.collection.on('sync', this.render, this);
  },

  render: function render() {
    var context = {
      'name': this.name,
      'columns': this.columns,
      'lines': this.collection.toJSON()
    };

    var html = this.tmpl(context);
    this.$el.empty().html(html);
  },

  selected: function selected() {
    var inputs = this.$el.find('.select');
    return _.chain(inputs)
      .filter(function(input) {
        return input.checked === true;
      })
      .map(function(input) {
        return parseInt($(input).data('id'), 10);
      })
      .value();
  },

  get: function get(id) {
    return this.$el.find('[data-id="' + id + '"]');
  },

  onClick: function onClick(e) {
    var el = $(e.currentTarget).parent();
    App.router.navigate(this.name + '/edit/' + el.data('id'), {trigger: true});
  },

  onDelete: function onDelete() {
    this.selected().forEach(function(id) {
      var model = this.collection.get(id);
      if(model) {
        model.destroy();
      } else {
        console.error('Model %d not found', id);
      }
    }, this);
    return false;
  },

  onAll: function onAll() {
    this.all = !this.all;
    this.$el.find('tbody .select').each(function(index, input) {
      $(input).prop('checked', this.all);
    }.bind(this));
  },

  onQuickCheck: function onQuickCheck(e) {
    var el = $(e.currentTarget);
    var id = el.data('id');
    var attribute = el.data('attribute');
    var checked = el.prop('checked');

    var model = this.collection.get(id);
    model.set(attribute, checked);
    model.save();
  }

});