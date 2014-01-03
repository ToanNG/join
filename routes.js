var passport = require('passport'),
	user = require('./routes/user'),
	group = require('./routes/group');

var auth = function(req, res, next) {
	if (!req.isAuthenticated())
		res.render('401.jade');
	else
		next();
};

var authz = function(req, res, next) {
	if (req.user && req.user.username == req.params.username)
		next();
	else
		res.render('401.jade');
};

var checkLogin = function(req, res, next) {
	if (req.isAuthenticated())
		res.redirect('/users/' + req.user.username);
	else
		next();
};

exports = module.exports = function(app) {
	//front end
	app.get('/', checkLogin, require('./routes/index').index);
	app.get('/register', checkLogin, require('./routes/index').index);

	//login/out
	app.post('/login',
	  passport.authenticate('local', { failureRedirect: '/',
	                                   failureFlash: 'Invalid username or password.' }),
	  function(req, res) {
	    res.redirect('/users/' + req.user.username);
	});
	app.get('/logout', function(req, res){
	  req.logout();
	  res.redirect('/');
	});

	//facebook login/signup
	app.get('/auth/facebook',
	  passport.authenticate('facebook', { scope: ['read_stream', 'publish_actions'] })
	);
	app.get('/auth/facebook/callback', 
	  passport.authenticate('facebook', { failureRedirect: '/' }),
	  function(req, res) {
	    res.redirect('/users/' + req.user.username);
	});

	//user view
	app.get('/users', auth, user.list);
	app.get('/users/:username.:format?', authz, user.show);
	app.post('/users', user.post);

	//group view
	app.get('/users/:username/groups/:group_id', authz, group.show);
	app.post('/users/:username/groups', group.post);
	app.post('/users/:username/groups/add', group.add);
};