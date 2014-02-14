exports.index = function(req, res){
	res.render('index', { loginErr: req.flash('error'), 
												usernameErr: req.flash('username-error'),
                        fullnameErr: req.flash('fullname-error'),
												passwordErr: req.flash('password-error'),
												confirmPasswordErr: req.flash('confirm-password-error') });
};