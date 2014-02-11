(function(){
  var server = io.connect(window.location.origin);

  server.on('connect', function(){
    server.emit('user join', currentUser);
  });

  var chatGrid = $.fitgrid("#chat-windows-container");

  var openedChat = [];
  $(".group__name").click(function(){
    var groupId = $(this).data("groupid");

    if (openedChat.indexOf(groupId) != -1) return;

    var currentGroup = {
      id: groupId,
      name: $(this).text().trim()
    };
    
    $.when( Template.getTemplate("_chat-window") ).done(function(){
      var html = Template.render(currentGroup, "_chat-window");
      chatGrid.add(html, function(){
        openedChat.push(groupId);
      });
    });
  });
  $(document).on("click", ".helper--close-button", function(){
    var groupId = $(this).closest(".chat-window").attr("id").split("-")[1];
    chatGrid.remove($(this).closest(".fitgrid-slot"), function(){
      openedChat.remove(groupId);
    });
  });

  $(document).on("focus", ".chat-input", function(e){
    $(this).closest(".chat-window").find(".helper--buzz>i").removeClass("ding-dong");
  });

  $(document).on("keypress", ".chat-input", function(e){
    if (e.keyCode === 13) {
      if ($(this).val() === "") {return false;}
      
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
      $("#group-"+group).find(".chat-window__room").append("<div class='notice'>"+message+"</div>");
      return;
    }

    //[TASK] parse message to create notification
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

  //share feature
  $(document).on("click", ".helper--share", function(){
    window.sharingGroup = $(this).closest(".chat-window").attr("id").split("-")[1];

    $.when( Template.getTemplate("_share-popup") ).done(function(){
      var html = Template.render({username: currentUser.username}, "_share-popup"),
        image = {
          url: "",
          posTop: 0,
          posLeft: 0
        };

      $(html)
        .hide()
        .appendTo("#wrapper")
        .fadeIn("fast");

      $("#share-form").ajaxForm({
        beforeSend: function(){
          console.log("Uploading...");
        },
        success: function(url){
          image.url = url;
          loadCanvas(image);
          server.emit('update share', image, window.sharingGroup);
        },
        error: function(e){
          alert("Upload fails!");
        }
      });
    });
  });

  server.on('update share', function(image, group, user){
    if ($("#share-popup").length) {
      loadCanvas(image);
    }
  });

  function loadCanvas(image) {
    var imageObj = new Image();

    imageObj.onload = function() {
      var $container = $("#share-popup__canvas");

      var stage = new Kinetic.Stage({
        container: "share-popup__canvas",
        width: $container.width(),
        height: $container.height()
      });
      var layer = new Kinetic.Layer();

      var drawnImage = new Kinetic.Image({
        image: imageObj,
        x: image.posTop,
        y: image.posLeft,
        draggable: true
      });

      //add cursor styling
      drawnImage.on('mouseover', function() {
        document.body.style.cursor = 'pointer';
      });
      drawnImage.on('mouseout', function() {
        document.body.style.cursor = 'default';
      });

      drawnImage.on("dragend", function() {
        var points = drawnImage.getPosition();
        image.posTop = points.x;
        image.posLeft = points.y;
        server.emit('update share', image, window.sharingGroup);
      }); 

      layer.add(drawnImage);
      stage.add(layer);
    };

    imageObj.src = image.url;
  }
}());