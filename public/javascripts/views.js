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
    $('li[class^=user__]').removeClass("selected");
    $(".user__account").addClass("selected");
    new App.Views.User({ model: currentUser }).render();
  },

  listGroups: function() {
    $('li[class^=user__]').removeClass("selected");
    $(".user__chat").addClass("selected");
    var groups = new App.Collections.Groups;
    groups.fetchByUsername(window.currentUser.username).then(function() {
      new App.Views.Groups({ collection: groups }).render();
    });
  },

  listTasks: function() {
    $('li[class^=user__]').removeClass("selected");
    $(".user__task").addClass("selected");
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

  template: 'chat',

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
    TemplateManager.get(this.template, function(tmp) {
      var html = tmp( this.collection.toJSON() );
      this.$el.html(html);
      this.collection.each( this.addOne, this );
    }.bind(this));

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
    Group Tab View
\*------------------------------------*/

App.Views.Group = Backbone.View.extend({
  template: 'group-tab',

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
    $('body').append(addMemberPopupView.el);
  },

  render: function() {
    TemplateManager.get(this.template, function(tmp) {
      var html = tmp( this.model.toJSON() );
      this.setElement(html);
    }.bind(this));

    return this;
  }
});

/*------------------------------------*\
    Add Member Popup View
\*------------------------------------*/

App.Views.AddPopup = Backbone.View.extend({
  template: 'add-member-popup',

  initialize: function() {
    this.users = new App.Collections.Users;
    this.existedMembers = this.model.toJSON().users.map(function(user) {
      return user.username;
    });
    this.chosenMembers = [];
  },

  events: {
    'keyup #search-users-form': 'fetchUsers',
    'submit #search-users-form': function() { return false; },
    'click .cancel-button': 'closePopup',
    'click .confirm-button': 'submit',
    'click .not-a-member': 'addToChosenMembers'
  },

  fetchUsers: function(e) {
    delay(function(){
      var keyword = $(e.target).val(),
        $resultsContainer = $('#popup__results');

      this.users.fetch({ data: $.param({ name: keyword}) }).then(function() {
        $resultsContainer.empty();

        this.users.toJSON().forEach(function(user) {
          var fullname = user.fullname.highlight(keyword),
            username = user.username.highlight(keyword);

          if (this.existedMembers.indexOf(user.username) != -1) {
            $resultsContainer.append('<div class="single-result"><i class="fa fa-check-square"></i>'+fullname+' ('+username+')'+'</div>');
          } else {
            $resultsContainer.append('<div class="single-result not-a-member" data-userid="'+user._id+'"><i class="fa fa-plus-square"></i>'+fullname+' ('+username+')'+'</div>');
          }
        }.bind(this));
      }.bind(this));
    }.bind(this), 1000 );
  },

  closePopup: function() {
    this.unrender();
  },

  submit: function() {
    this.chosenMembers = this.chosenMembers.remove(undefined).uniq();
    console.log(this.chosenMembers);
  },

  addToChosenMembers: function(e) {
    var $target = $(e.target);

    if ($target.hasClass('chosen')) {
      $target.removeClass('chosen');
      this.chosenMembers.remove($target.data('userid'));
    } else {
      $target.addClass('chosen');
      this.chosenMembers.push($target.data('userid'));
    }
  },

  render: function() {
    TemplateManager.get(this.template, function(tmp) {
      var html = tmp( this.model.toJSON() );
      this.setElement(html);
    }.bind(this));
    
    $('#wrapper').addClass('ios7-effect');

    return this;
  },

  unrender: function() {
    this.$el.remove();
    $('#wrapper').removeClass('ios7-effect');
  }
});

/*------------------------------------*\
    Chat Window View
\*------------------------------------*/

App.Views.Window = Backbone.View.extend({
  template: 'chat-window',

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
    TemplateManager.get(this.template, function(tmp) {
      var html = tmp( this.model );
      this.setElement(html);
    }.bind(this));

    return this;
  }
});

/*------------------------------------*\
    Profile View
\*------------------------------------*/

App.Views.User = Backbone.View.extend({
  el: '.user-content',

  template: 'profile',

  initialize: function() {
    this.$el.off();
  },

  render: function() {
    TemplateManager.get(this.template, function(tmp) {
      var html = tmp( this.model );
      this.$el.html(html);
    }.bind(this));

    return this;
  }
});

/*------------------------------------*\
    Tasks List View
\*------------------------------------*/

App.Views.Tasks = Backbone.View.extend({
  el: '.user-content',

  template: 'tasks',

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

    TemplateManager.get(this.template, function(tmp) {
      var html = tmp( {
        receivedTasks: receivedTasks,
        givenTasks: givenTasks
      } );
      this.$el.html(html);
    }.bind(this));

    return this;
  }
});