exports.list = function(req, res){
	res.app.db.models.User.find(function(err, users){
		res.send(users);
	});
};

exports.show = function(req, res){
	res.app.db.models.Group.find({'users._id': req.user._id}, function(err, groups){
      res.render('user/chat', {user: req.user, groups: groups});
  });
};

exports.post = function(req, res){
  if (req.body.password != req.body.confirm_password) {
    req.flash('confirm-password-error', 'Password does not match.');
    res.redirect('/register');
  } else {
    new res.app.db.models.User({
    	username: req.body.username,
    	password: req.body.password,
    	fullname: req.body.fullname,
      avatar: "https://1.gravatar.com/avatar/a13b9d1fc146fc072c60d55dd348ddb6?d=https%3A%2F%2Fidenticons.github.com%2F456925e5b42509e868df6466fdf9cef5.png&r=x&s=440",
      groups: []
    }).save(function(err, user){
      if (err && err.err) {
        req.flash('username-error', 'This username has been taken.');
      } else if (err && err.errors) {
        var errors = err.errors;
        for(var error in errors) {
            errors[error].message = errors[error].message.replace(/Path|`/g, ' ').trim();
            req.flash(errors[error].path+'-error', capitaliseFirstLetter(errors[error].message));
        }
      }
      res.redirect('/register');
    });
  }
};

function capitaliseFirstLetter(string){
  return string.charAt(0).toUpperCase() + string.slice(1);
}