/*------------------------------------*\
    Global App View
\*------------------------------------*/

App.Views.App = Backbone.View.extend({
  initialize: function() {
    vent.on('user:show', this.showUser, this);
    vent.on('group:list', this.listGroups, this);
    vent.on('task:list', this.listTasks, this);

    App.server = io.connect(window.location.origin);

    App.server.on('connect', function() {
      App.server.emit('user join', currentUser);
    });

    App.server.on('update chat', function(message, group, user) {
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

  showUser: function() {
    new App.Views.User({ model: currentUser }).render();
  },

  listGroups: function() {
    var groups = new App.Collections.Groups;
    groups.fetchByUsername(window.currentUser.username).then(function() {
      new App.Views.Groups({ collection: groups }).render();
    });
  },

  listTasks: function() {
    var tasks = new App.Collections.Tasks;
    tasks.fetchByUsername(window.currentUser.username).then(function() {
      new App.Views.Tasks({ collection: tasks }).render();
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
    this.$el.off(); //this prevents zombie view

    this.collection.on('add', this.addOne, this);
    this.chatGrid = $.fitgrid("#chat-windows-container");
    this.openedChat = [];
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
    this.collection.each( this.addOne, this );
    return this;
  },

  addOne: function(group) {
    var groupView = new App.Views.Group({
      model: group,
      parent: this
    });
    this.$el.find('.groups-list').append(groupView.render().el);
  }
});

/*------------------------------------*\
    Group View
\*------------------------------------*/

App.Views.Group = Backbone.View.extend({
  template: template('groupTemplate'),

  initialize: function(options) {
    this.parent = options.parent;
  },

  events: {
    'click .group__name': 'openChatWindow',
    'click .add-member-button': 'openAddMemberPopup'
  },

  openChatWindow: function(e) {
    var groupId = $(e.target).data("groupid");

    if (this.parent.openedChat.indexOf(groupId) != -1) return;

    var currentGroup = {
      id: groupId,
      name: $(e.target).text().trim()
    };
    
    var chatWindowView = new App.Views.Window({
      model: currentGroup,
      parent: this.parent
    }).render();

    this.parent.chatGrid.add(chatWindowView.el, function() {
      this.parent.openedChat.push(groupId);
    }.bind(this));
  },

  openAddMemberPopup: function(e) {
    var addMemberPopupView = new App.Views.AddPopup({ model: this.model }).render();
    this.$el.append(addMemberPopupView.el);
  },

  render: function() {
    var html = this.template( this.model.toJSON() );
    this.setElement(html);
    return this;
  }
});

/*------------------------------------*\
    Add Member Popup View
\*------------------------------------*/

App.Views.AddPopup = Backbone.View.extend({
  template: template('addMemberPopupTemplate'),

  initialize: function() {
    this.users = new App.Collections.Users;
  },

  events: {
    'keyup #search-users-form': 'fetchUsers'
  },

  fetchUsers: function(e) {
    delay(function(){
      var keyword = $(e.target).val(),
        $resultsContainer = $('#add-member-popup__results');

      this.users.fetch({ data: $.param({ name: keyword}) }).then(function() {
        $resultsContainer.empty();

        this.users.toJSON().forEach(function(user) {
          user.fullname = user.fullname.highlight(keyword);
          user.username = user.username.highlight(keyword);
          $resultsContainer.append('<p>'+user.fullname+' ('+user.username+')'+'</p>');
        });
      }.bind(this));
    }.bind(this), 1000 );
  },

  render: function() {
    var html = this.template( this.model.toJSON() );
    this.setElement(html);
    return this;
  }
});

/*------------------------------------*\
    Chat Window View
\*------------------------------------*/

App.Views.Window = Backbone.View.extend({
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

    this.parent.chatGrid.remove($(e.target).closest(".fitgrid-slot"), function() {
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

/*------------------------------------*\
    Profile View
\*------------------------------------*/

App.Views.User = Backbone.View.extend({
  el: '.user-content',

  template: template('profileTemplate'),

  initialize: function() {
    this.$el.off();
  },

  render: function() {
    this.$el
      .html( this.template( this.model ) );
    return this;
  }
});

/*------------------------------------*\
    Tasks List View
\*------------------------------------*/

App.Views.Tasks = Backbone.View.extend({
  el: '.user-content',

  template: template('tasksTemplate'),

  initialize: function() {
    this.$el.off();
  },

  render: function() {
    var receivedTasks = [],
        givenTasks = [];

    this.collection.toJSON().forEach(function(task) {
      if (task.receiver._id == currentUser._id.toString()) {
        receivedTasks.push(task);
      } else {
        givenTasks.push(task);
      }
    });

    this.$el
      .html( this.template( {
        receivedTasks: receivedTasks,
        givenTasks: givenTasks
      } ) );
    return this;
  }
});