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

$(document).on("submit", ".chat-form", function(e){
  var message = $(this).find(".chat-input").val(),
    group = $(this).data("groupid");
  server.emit('update chat', message, group);
  return false;
});

server.on('update chat', function(data, group, username) {
  $("#group-"+group).find(".chat-window__room").append("<div>"+username+": "+data+"</div>");
});