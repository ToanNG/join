var server = io.connect('http://localhost');

server.on('connect', function() {
  console.log("You're online.");
});

var chatGrid = $.fitgrid("#chat-windows-container");

$(".group__name").click(function(){
  var currentGroup = {
    id: $(this).data("groupid"),
    name: $(this).text().trim()
  };
  
  $.when( Template.getTemplate("chat-window") ).done(function(){
    var html = Template.render(currentGroup, "chat-window");

    chatGrid.add(html, function(){
      server.emit('user join', currentUser, currentGroup.id);
    });
  });
});

// $("#chat-form").submit(function(e){
//   var message = $("#chat-input").val();
//   server.emit('updatechat', message, groupId);
//   return false;
// });

server.on('update chat', function(data) {
  $("#chat-room").append("<div>"+data+"</div>");
});