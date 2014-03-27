var passport = require('passport')
	, home = require('./routes/home')
	, user = require('./routes/user')
	, group = require('./routes/group')
	, task = require('./routes/task');

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
		res.redirect('/users/' + req.user.username + '#chat');
	else
		next();
};

exports = module.exports = function(app) {
	//front end
	app.get('/', checkLogin, home.index);
	app.get('/login', checkLogin, home.login);
	app.get('/register', checkLogin, home.register);

	//login/logout
	app.post('/login',
	  passport.authenticate('local', { failureRedirect: '/login',
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
	  passport.authenticate('facebook', { failureRedirect: '/login' }),
	  function(req, res) {
	    res.redirect('/users/' + req.user.username);
	});

	//user view
	app.get('/users', auth, user.list);
	app.get('/users/:username.:format?', authz, user.show);
	app.post('/users', user.post);
	app.put('/users/:username', authz, user.update);
	app.get('/users/search', auth, user.search);
	app.post('/users/:username/upload', authz, user.upload);

	//group view
	app.get('/users/:username/groups', authz, group.list);
	app.get('/users/:username/groups/:group_id', authz, group.show);
	app.post('/users/:username/groups', authz, group.post);
	app.put('/users/:username/groups/:group_id', authz, group.update);

	//task view
	app.get('/users/:username/tasks', authz, task.list);
	app.post('/users/:username/tasks', authz, task.post);
};