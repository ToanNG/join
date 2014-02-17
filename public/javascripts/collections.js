App.Collections.Groups = Backbone.Collection.extend({
  model: App.Models.Group,

  username: '',

  url: function() {
    return '/users/' + this.username + '/groups';
  },

  fetchByUsername: function(usr) {
    this.username = usr;
    return this.fetch();
  }
});

App.Collections.Tasks = Backbone.Collection.extend({
  model: App.Models.Task,

  username: '',

  url: function() {
    return '/users/' + this.username + '/tasks';
  },

  fetchByUsername: function(usr) {
    this.username = usr;
    return this.fetch();
  }
});