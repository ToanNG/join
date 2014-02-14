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