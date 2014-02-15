App.Router = Backbone.Router.extend({
  routes: {
    '': 'index',
    'profile': 'showUser',
    'chat': 'listGroups',
    'tasks': 'listTasks',
    'setting': 'setting',
    '*other': 'index'
  },

  index: function() {
    Backbone.history.navigate('/chat', true);
  },

  showUser: function() {
    
  },

  listGroups: function() {
    App.groups = new App.Collections.Groups;
    App.groups.fetchByUsername(window.currentUser.username).then(function() {
      var allGroupsView = new App.Views.Groups({ collection: App.groups }).render();
      $('.user-content').append(allGroupsView.el);
    });
  },

  listTasks: function() {
    
  },

  setting: function() {
    
  }
});