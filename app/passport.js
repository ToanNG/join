exports = module.exports = function(app, passport) {
	var LocalStrategy = require('passport-local').Strategy,
		FacebookStrategy = require('passport-facebook').Strategy;

	passport.use(new LocalStrategy({
			usernameField: 'username',
			passwordField: 'password'
		},
		function(username, password, done) {
	    app.db.models.User.findOne({ username: username }, function(err, user) {
				if (err) { return done(err); }

				if (!user) {
					return done(null, false, { message: 'Incorrect username.' });
				}

				if (!user.validPassword(password)) {
					return done(null, false, { message: 'Incorrect password.' });
				}

				return done(null, user);
	    });
		}
	));

	passport.use(new FacebookStrategy({
	    clientID: app.config.facebook_app_id,
	    clientSecret: app.config.facebook_app_secret,
	    callbackURL: app.config.facebook_callback_url
	  },
	  function(accessToken, refreshToken, profile, done) {
	  	app.db.models.User.findOne({facebook_id: profile.id}, function(err, user) {
	  		if (err) { return done(err); }

    		if (!user) {
      		new app.db.models.User({
				    username: profile.username.replace(".", ""),
				    password: "",     
				    fullname: (profile.name.givenName+" "+profile.name.familyName+" "+profile.name.middleName).replace(/undefined/g, "").trim(),
				    facebook_id: profile.id,
				    avatar: "https://graph.facebook.com/"+profile.username+"/picture",
				    groups: []
				  }).save(function(err, user){
				  	if (err) { return done(err); }

				  	return done(null, user);
  				});
    		} else {
  				return done(null, user);
    		}
  		});
	  }
	));

	passport.serializeUser(function(user, done) {
		done(null, user._id);
	});

	passport.deserializeUser(function(_id, done) {
		app.db.models.User.findById(_id, 'username fullname avatar groups tasks', function(err, user) {
			done(err, user);
		});
	});
};