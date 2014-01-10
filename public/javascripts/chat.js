var server = io.connect('http://localhost');

server.on('connect', function() {
  console.log('User has came online');
});

var chatGrid = $.fitgrid("#chat-windows-container");
html = "<div class='chat-window show'>"+
    "<form id='chat-form' method='POST' autocomplete='off'>"+
      "<input id='chat-input' name='chat-input' type='text'>"+
      "<input id='submit-button' type='submit' value='Send'>"+
    "</form>"+
    "<div id='chat-room'>"+
    "</div>"+
  "</div>";

$(".group__name").click(function(){
  var groupId = $(this).data("groupid");
  chatGrid.add(html, function(){
    server.emit('user join', currentUser, groupId);

    $("#chat-form").submit(function(e){
      var message = $("#chat-input").val();
      server.emit('updatechat', message, groupId);
      return false;
    });

    server.on('update chat', function(data) {
      $("#chat-room").append("<div>"+data+"</div>");
    });
  });
});