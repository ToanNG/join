/**
 * [Require authorization] List all groups of current user
 * @return {Array} groups
 */
exports.list = function(req, res){
	res.app.db.models.Group
    .find({ '_id': {$in:req.user.groups} })
    .populate('users', 'username fullname avatar')
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
	res.app.db.models.Group
		.findOne({_id: req.params.group_id})
		.populate('users', 'username fullname avatar')
		.exec(function(err, group){
      res.send(group);
    });
};

/**
 * [Require authorization] Create new group
 * @param {String} group_name
 * @return {JSON} group
 */
exports.post = function(req, res){
	new res.app.db.models.Group({
		group_name: req.body.group_name,
		users: [ req.user._id ]
	}).save(function(err, group){
		res.app.db.models.User.update(
			{ _id: req.user._id },
			{ $push: {groups:group._id} },
			function(err, numberAffected, raw){
				group.populate({
				  path: 'users',
				  select: 'username fullname avatar'
				}, function (err, group){
				  res.send(group);
				})
			});
	});
};

/**
 * [Require authorization] Update a group of current user
 * @param {String} group_name
 * @param {Array} user_id_array 
 * @return {JSON} group
 */
exports.update = function(req, res){
	var p = req.params,
		b = req.body;
	if (req.user.groups.indexOf(p.group_id) == -1) {
		res.send("Can not modify group "+p.group_id);
	} else {
		res.app.db.models.Group.findById(p.group_id, function(err, group){
			group.group_name = b.group_name || group.group_name;
			group.users = b.user_id_array || group.users;
			group.save(function(err){
				if (!err) {
					res.send(group);
				} else {
					res.send(err);
				}
			});
		});
	}
};