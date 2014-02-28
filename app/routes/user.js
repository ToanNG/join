/**
 * [Require authentication] List all users
 * @return {Array} users
 */
exports.list = function(req, res){
  res.app.db.models.User.find({}, 'username fullname avatar groups tasks', function(err, users){
    res.send(users);
  });
};

/**
 * [Require authorization] Render user template
 */
exports.show = function(req, res){
  res.render('user', {user: req.user});
};

/**
 * Create new user
 */
exports.post = function(req, res){
  var b = req.body,
    isPasswordValid = true;
  if (b.password != b.confirm_password) {
    req.flash('confirm-password-error', 'Password does not match.');
    isPasswordValid = false;
  } 
  if (b.password.length < 8) {
    req.flash('password-error', 'Password length must be > 7.');
    isPasswordValid = false;
  }
  if (!isPasswordValid) {
    res.redirect('/register');
  } else {
    new res.app.db.models.User({
      username: b.username,
      password: b.password,
      fullname: b.fullname,
      avatar: "https://secure.gravatar.com/avatar/8ac18f1eccadee3bed611b0423126a66?s=75&r=any&d=mm&time=46322817",
      groups: [],
      tasks: []
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

/**
 * [Require authorization] Update current user
 * @param {String} password
 * @param {String} fullname
 * @param {String} avatar_url
 * @param {Array} group_id_array
 * @param {Array} task_id_array
 * @return {JSON} user
 */
exports.update = function(req, res){
  var b = req.body;
  res.app.db.models.User.findById(req.user._id, function(err, user){
    user.password = b.password || user.password;
    user.fullname = b.fullname || user.fullname;
    user.avatar = b.avatar_url || user.avatar;
    user.groups = b.group_id_array || user.groups;
    user.tasks = b.task_id_array || user.tasks;
    user.save(function(err){
      if (!err) {
        res.send(user);
      } else {
        res.send(err);
      }
    });
  });
};

/**
 * [Require authentication] Search users by username or fullname
 * @return {Array} users
 */
exports.search = function(req, res){
  res.app.db.models.User
    .find({
      $or:[
        { username: new RegExp(req.query.name, "i") },
        { fullname: new RegExp(req.query.name, "i") },
      ]}, 'username fullname avatar')
    .exec(function(err, users){
      res.send(users);
    });
};

/**
 * [Require authorization] Upload image to S3
 * @param {String} crop
 * @param {File} image
 * @return {String} aws_url
 */
var AWS = require('aws-sdk');

AWS.config.loadFromPath('./app/aws.json');

exports.upload = function(req, res){
  var s3 = new AWS.S3(),
    image = req.files.image;
  if (req.query.crop == "true") {
    var cropPath = "public/images/avatar/"+image.name;
    require('imagemagick').crop({
      srcPath: image.path,
      dstPath: cropPath,
      width: 200,
      height: 200,
      quality: 1
    }, function(err, stdout, stderr){
      require('fs').readFile(cropPath, function(err, file_buffer){
        var params = {
          Bucket: 'join-development',
          Key: 'images/avatar/'+image.name,
          Body: file_buffer,
          ACL: 'public-read'
        };
        s3.putObject(params, function(err, data) {
          var aws_url = 'https://'+params.Bucket+'.s3.amazonaws.com/'+params.Key;
          res.send(aws_url);
        });
      });
    });
  } else {
    require('fs').readFile(image.path, function(err, file_buffer){
      var params = {
        Bucket: 'join-development',
        Key: 'images/share/'+image.name,
        Body: file_buffer,
        ACL: 'public-read'
      };
      s3.putObject(params, function(err, data) {
        var aws_url = 'https://'+params.Bucket+'.s3.amazonaws.com/'+params.Key;
        res.send(aws_url);
      });
    });
  }
};

function capitaliseFirstLetter(string){
  return string.charAt(0).toUpperCase() + string.slice(1);
}