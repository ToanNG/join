
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { loginErr: req.flash('error'), 
  						usernameErr: req.flash('username-error'),
  						passwordErr: req.flash('password-error'),
  						confirmPasswordErr: req.flash('confirm-password-error'), });
};