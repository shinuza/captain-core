App.Users = Backbone.Collection.extend({

  url: '/users'

});

App.Posts = Backbone.Collection.extend({

  url: '/posts/'

});

App.Tags = Backbone.Collection.extend({

  url: '/tags'

});
