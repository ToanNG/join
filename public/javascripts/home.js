if (window.location.pathname.indexOf("register") == -1) {
	$("#login-form").show();
} else {
	$("#signup-form").show();
}

$("#switch-signup-link").click(function(){
	$("#login-form").slideUp(300);
	$("#signup-form").slideDown(300);
});

$("#switch-login-link").click(function(){
	$("#login-form").slideDown(300);
	$("#signup-form").slideUp(300);
});

$("#login-form").find("input").on("focusin", function(){
	$(".error-dialog-box").removeClass("jelly-show").addClass("jelly-hide");
});