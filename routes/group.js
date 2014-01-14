exports.show = function(req, res){
	res.app.db.models.Group.findOne({_id: req.params.group_id}, function(err, group){
		res.send({user: req.user, group: group});
	});
};

exports.post = function(req, res){
	res.app.db.models.User.findOne({username: req.params.username}, function(err, user){
  	new res.app.db.models.Group({
			group_name: req.body.group_name,
			users: [
				{
					_id: user._id,
					fullname: user.fullname,
					avatar: user.avatar
				}
			]
		}).save(function(err, group){
			//update current user
			user.groups.push(group._id);
			user.save(function(err, user){
				if (err)
					res.send(err);
				else
					res.redirect('/users/' + user.username + '/chat');
			});
		});
	});
};

exports.add = function(req, res){
	res.app.db.models.User.findOne({username: req.body.username}, function(err, user){
		user.groups.push(req.body.group_id);
		user.save(function(err, user){
			res.app.db.models.Group.findOne({_id: req.body.group_id}, function(err, group){
				group.users.push({
					_id: user._id,
					fullname: user.fullname,
					avatar: user.avatar
				});
				group.save(function(err, group){
					res.send(group);
					// res.redirect('/users/' + user.username);
				});
			});
		});
	});
};