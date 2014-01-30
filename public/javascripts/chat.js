(function(){
  var server = io.connect('http://localhost:3000');

  server.on('connect', function(){
    server.emit('user join', currentUser);
  });

  var chatGrid = $.fitgrid("#chat-windows-container");

  var openedChat = [];
  $(".group__name").click(function(){
    var groupId = $(this).data("groupid");

    if (openedChat.indexOf(groupId) != -1) return;

    openedChat.push(groupId);

    var currentGroup = {
      id: groupId,
      name: $(this).text().trim()
    };
    
    $.when( Template.getTemplate("_chat-window") ).done(function(){
      var html = Template.render(currentGroup, "_chat-window");
      chatGrid.add(html, function(){});
    });
  });

  $(document).on("focus", ".chat-input", function(e){
    $(this).closest(".chat-window").find(".helper--buzz>i").removeClass("ding-dong");
  });

  $(document).on("keypress", ".chat-input", function(e){
    if (e.keyCode === 13) {
      $(this).closest(".chat-form").submit();
      $(this).val("");
      e.preventDefault();
      return false;
    }
    return true;
  });

  $(document).on("submit", ".chat-form", function(e){
    var message = $(this).find(".chat-input").val(),
      group = $(this).data("groupid");
    server.emit('update chat', message, group);
    return false;
  });

  server.on('update chat', function(message, group, user){
    if (typeof user === "undefined") {
      $("#group-"+group).find(".chat-window__room").append("<div>"+message+"</div>");
      return;
    }

    //[TASK] parse message to create notification
    if (message.indexOf("@"+currentUser.username) != -1) {
      $("#group-tab-"+group).css("background-color", "red");
      $("#group-"+group).find(".helper--buzz>i").addClass("ding-dong");
    }

    var userType = user.username === currentUser.username ? "me" : "guest";
    $("#group-"+group).find(".chat-window__room").append(
      "<div class='chat-line--"+userType+" jelly-show'>"+
        "<img class='avatar small' src='"+user.avatar+"'/>"+
        "<div class='chat-box'>"+
          message+
        "</div>"+
        "<div class='clear'></div>"+
      "</div>");
  });
}());