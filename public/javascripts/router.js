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
    vent.trigger('user:show');
  },

  listGroups: function() {
    vent.trigger('group:list');
  },

  listTasks: function() {
    vent.trigger('task:list');
  },

  setting: function() {
    
  }
});