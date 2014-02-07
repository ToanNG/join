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
      $("#group-"+group).find(".chat-window__room").append("<div>"+message+"</div>");
      return;
    }

    //[TASK] parse message to create notification
    if (message.indexOf("@"+currentUser.username) != -1) {
      $("#group-tab-"+group).css("background-color", "red");
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
      var html = Template.render({username: currentUser.username}, "_share-popup");

      $(html)
        .hide()
        .appendTo("#wrapper")
        .fadeIn("fast");

      $("#share-form").ajaxForm({
        beforeSend: function(){
          console.log("Begin upload");
        },
        success: function(url){
          server.emit('user share', url, window.sharingGroup);
        },
        error: function(e){
          alert("Upload fails!");
        }
      });
    });
  });

  server.on('user share', function(url, group, user){
    if ($("#share-wrapper").length) {
      loadCanvas(url);
    }
  });

  server.on('update share', function(url, group, user, x, y){
    if ($("#share-wrapper").length) {
      console.log("receive "+x+","+y);
      loadCanvas(url, x, y);
    }
  });

  function loadCanvas(dataURL, posX, posY) {
    var imageObj = new Image();

    imageObj.onload = function() {
      var stage = new Kinetic.Stage({
        container: "share-canvas",
        width: 900,
        height: 600
      });
      var layer = new Kinetic.Layer();

      // darth vader
      if (posX) {
        var darthVaderImg = new Kinetic.Image({
          image: imageObj,
          x: posX,
          y: posY,
          draggable: true
        });
      } else {
        var darthVaderImg = new Kinetic.Image({
          image: imageObj,
          x: 0,
          y: 0,
          draggable: true
        });
      }

      // add cursor styling
      darthVaderImg.on('mouseover', function() {
        document.body.style.cursor = 'pointer';
      });
      darthVaderImg.on('mouseout', function() {
        document.body.style.cursor = 'default';
      });

      darthVaderImg.on("dragend", function() {
        var points = darthVaderImg.getPosition();
        server.emit('update share', dataURL, window.sharingGroup, points.x, points.y);
        console.log(points.x + ',' + points.y);
      }); 

      layer.add(darthVaderImg);
      stage.add(layer);
    };

    imageObj.src = dataURL;
  }
}());