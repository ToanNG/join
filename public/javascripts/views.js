App.Views.Groups = Backbone.View.extend({
  el: '.user-content',

  template: template('chatTemplate'),

  initialize: function() {
    this.collection.on('add', this.render, this);
  },

  events: {
    'submit #new-group-form': 'submit'
  },

  submit: function(e) {
    e.preventDefault();

    this.collection.create({
      group_name: $('#group_name').val()
    }, { wait: true });
  },

  render: function() {
    this.$el
      .html( this.template( this.collection.toJSON() ) );
    return this;
  },
});