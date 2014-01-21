var AWS = require('aws-sdk');
AWS.config.loadFromPath('./aws.json');

exports.upload = function(req, res){
  var s3 = new AWS.S3();
  s3.putObject({
    Bucket: 'join-development',
    Key: req.body.key,
    Body: 'Hello!'
  }, function() {
    res.send("Successfully uploaded "+req.body.key+" to join-development");
  });
};

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
  var isPasswordValid = true;
  if (req.body.password != req.body.confirm_password) {
    req.flash('confirm-password-error', 'Password does not match.');
    isPasswordValid = false;
  } 
  if (req.body.password.length < 8) {
    req.flash('password-error', 'Password length must be > 7.');
    isPasswordValid = false;
  }
  if (!isPasswordValid) {
    res.redirect('/register');
  } else {
    new res.app.db.models.User({
    	username: req.body.username,
    	password: req.body.password,
    	fullname: req.body.fullname,
      avatar: "https://secure.gravatar.com/avatar/8ac18f1eccadee3bed611b0423126a66?s=75&r=any&d=mm&time=46322817",
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