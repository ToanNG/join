(function(){
  var server = io.connect('http://localhost');

  server.on('connect', function(){
    console.log("You're online.");
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
    
    $.when( Template.getTemplate("chat-window") ).done(function(){
      var html = Template.render(currentGroup, "chat-window");

      chatGrid.add(html, function(){
        server.emit('user join', currentUser, currentGroup.id);
      });
    });
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

  server.on('update chat', function(data, group, username){
    $("#group-"+group).find(".chat-window__room").append("<div>"+username+": "+data+"</div>");
  });
}());