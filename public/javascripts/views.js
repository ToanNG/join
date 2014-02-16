/*------------------------------------*\
    Global App View
\*------------------------------------*/

App.Views.App = Backbone.View.extend({
  initialize: function() {
    vent.on('group:list', this.listGroups, this);

    App.server = io.connect(window.location.origin);

    App.server.on('connect', function(){
      App.server.emit('user join', currentUser);
    });
  },

  listGroups: function() {
    App.groups = new App.Collections.Groups;
    App.groups.fetchByUsername(window.currentUser.username).then(function() {
      new App.Views.Groups({ collection: App.groups }).render();
    });
  }
});

/*------------------------------------*\
    Chat View
\*------------------------------------*/

App.Views.Groups = Backbone.View.extend({
  el: '.user-content',

  template: template('chatTemplate'),

  initialize: function() {
    this.collection.on('add', this.render, this);
    this.chatGrid = $.fitgrid("#chat-windows-container");
    this.openedChat = [];

    App.server.on('update chat', function(message, group, user){
      if (typeof user === "undefined") {
        $("#group-"+group).find(".chat-window__room").append("<div class='notice'>"+message+"</div>");
        return;
      }

      if (message.indexOf("@"+currentUser.username) != -1) {
        $("#group-"+group).find(".helper--buzz>i").addClass("ding-dong");
      }

      var userType = user.username === currentUser.username ? "me" : "guest",
        $chatRoom = $("#group-"+group).find(".chat-window__room");
      $chatRoom
        .append(
          "<div class='chat-line--"+userType+" jelly-show'>"+
            "<img class='avatar small' src='"+user.avatar+"'/>"+
            "<div class='chat-box'>"+
              message+
            "</div>"+
            "<div class='clear'></div>"+
          "</div>")
        .scrollTop($chatRoom.prop("scrollHeight") - $chatRoom.height());
    });
  },

  events: {
    'submit #new-group-form': 'submit',
    'click .group__name': 'openChatWindow'
  },

  submit: function(e) {
    e.preventDefault();

    this.collection.create({
      group_name: $('#group_name').val()
    }, { wait: true });
  },

  openChatWindow: function(e) {
    var groupId = $(e.target).data("groupid");

    if (this.openedChat.indexOf(groupId) != -1) return;

    var currentGroup = {
      id: groupId,
      name: $(e.target).text().trim()
    };
    
    var chatWindowView = new App.Views.Group({
      model: currentGroup,
      parent: this
    }).render();

    this.chatGrid.add(chatWindowView.el, function(){
      this.openedChat.push(groupId);
    }.bind(this));
  },

  render: function() {
    this.$el
      .html( this.template( this.collection.toJSON() ) );
    return this;
  },
});

/*------------------------------------*\
    Chat Window View
\*------------------------------------*/

App.Views.Group = Backbone.View.extend({
  template: template('chatWindowTemplate'),

  initialize: function(options) {
    this.parent = options.parent;
  },

  events: {
    'click .helper--close-button': 'closeChatWindow',
    'focus .chat-input': 'focusChatWindow',
    'keypress .chat-input': 'enterChatWindow',
    'submit .chat-form': 'submitChatWindow'
  },

  closeChatWindow: function(e) {
    var groupId = $(e.target).closest(".chat-window").attr("id").split("-")[1];

    this.parent.chatGrid.remove($(e.target).closest(".fitgrid-slot"), function(){
      this.parent.openedChat.remove(groupId);
    }.bind(this));
  },

  focusChatWindow: function(e) {
    $(e.target).closest(".chat-window").find(".helper--buzz>i").removeClass("ding-dong");
  },

  enterChatWindow: function(e) {
    if (e.keyCode === 13) {
      if ($(e.target).val() === "") {return false;}
      
      $(e.target).closest(".chat-form").submit();
      $(e.target).val("");
      e.preventDefault();
      return false;
    }
    return true;
  },

  submitChatWindow: function(e) {
    var message = $(e.target).find(".chat-input").val(),
      group = $(e.target).data("groupid");
    App.server.emit('update chat', message, group);
    return false;
  },

  render: function() {
    var html = this.template( this.model );
    this.setElement(html);
    return this;
  }
});