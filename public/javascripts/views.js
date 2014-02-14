App.Views.Groups = Backbone.View.extend({
  tagName: 'div',

  template: template('allGroupsTemplate'),

  render: function() {
    this.$el
      .addClass('groups-list drop-shadow round-corner')
      .html( this.template( this.collection.toJSON() ) );
    return this;
  },
});