exports.index = function(req, res){
	res.render('index');
};

exports.login = function(req, res){
	res.render('login', {loginErr: req.flash('error')});
};

exports.register = function(req, res){
	res.render('register', {usernameErr: req.flash('username-error'),
												  fullnameErr: req.flash('fullname-error'),
												  passwordErr: req.flash('password-error'),
												  confirmPasswordErr: req.flash('confirm-password-error')});
};