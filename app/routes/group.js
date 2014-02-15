exports.list = function(req, res){
	res.app.db.models.Group
    .find({'users': req.user._id})
    .populate('users', 'fullname avatar')
    .exec(function(err, groups){
      res.send(groups);
    });
};

exports.show = function(req, res){
	res.app.db.models.Group.findOne({_id: req.params.group_id}, function(err, group){
		res.send({user: req.user, group: group});
	});
};

exports.post = function(req, res){
	res.app.db.models.User.findOne({username: req.params.username}, function(err, user){
  	new res.app.db.models.Group({
			group_name: req.body.group_name,
			users: [ user._id ]
		}).save(function(err, group){
			//update current user
			user.groups.push(group._id);
			user.save(function(err, user){
				if (err)
					res.send(err);
				else
					var result = {
						_id: group._id,
						group_name: group.group_name,
						users: [
							{
								_id: user._id,
								fullname: user.fullname,
								avatar: user.avatar
							}
						]
					};
					res.send(result);
			});
		});
	});
};

exports.add = function(req, res){
	res.app.db.models.User.findOne({username: req.body.username}, function(err, user){
		user.groups.push(req.body.group_id);
		user.save(function(err, user){
			res.app.db.models.Group.findOne({_id: req.body.group_id}, function(err, group){
				group.users.push(user._id);
				group.save(function(err, group){
					res.send(group);
					// res.redirect('/users/' + user.username);
				});
			});
		});
	});
};