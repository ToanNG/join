/**
 * [Require authorization] Show a list of groups of the current user
 * @return {Array} groups
 */
exports.list = function(req, res){
	res.app.db.models.Group
    .find({'users': req.user._id})
    .populate('users', 'username fullname avatar') //I love this one
    .exec(function(err, groups){
      res.send(groups);
    });
};

/**
 * [Require authorization] Show a single group
 * @param {String} group_id
 * @return {JSON} group
 */
exports.show = function(req, res){
	res.app.db.models.Group.findOne({_id: req.params.group_id}, function(err, group){
		res.send(group);
	});
};

/**
 * [Require authorization] Create new group
 * @param {String} username
 * @param {String} group_name
 * @return {JSON} result
 */
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
								username: user.username,
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

/**
 * Add users to one group (without invitations)
 * @param {Array} user_id_array 
 * @param {String} group_id
 * @return {JSON} raw
 */
exports.add = function(req, res){
	res.app.db.models.User.update(
		{ _id: {$in:req.body.user_id_array} },
		{ $push: {groups:req.body.group_id} },
		{ multi: true },
		function(err, numberAffected, raw){
			console.log('The number of updated users was %d', numberAffected);

			res.app.db.models.Group.update(
				{ _id: req.body.group_id },
				{ $pushAll: {users:req.body.user_id_array} },
				function(err, numberAffected, raw){
					console.log('The number of updated groups was %d', numberAffected);

					res.send(raw);
				});
		});
};