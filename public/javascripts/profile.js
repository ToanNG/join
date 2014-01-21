(function(){
  $("#upload-avatar-form").submit(function(){
    $.ajax({
      type: "POST",
      url: $(this).attr("action"),
      data: {
        "key": "file.txt"
      },
      success: function(){
        console.log("Upload successfully.");
      }
    });
    return false;
  });
}());