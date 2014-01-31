exports.list = function(req, res){
  res.app.db.models.Task
    .find({
      $or:[
        { _id: {$in:req.user.tasks} },
        { giver: req.user._id }
      ]})
    .populate('giver receiver', 'fullname')
    .exec(function(err, tasks){
      var receivedTasks = [],
        givenTasks = [];

      tasks.forEach(function(task){
        if (task.receiver._id == req.user._id.toString()) {
          receivedTasks.push(task);
        } else {
          givenTasks.push(task);
        }
      });

      res.render('user/tasks', {user: req.user, receivedTasks: receivedTasks, givenTasks: givenTasks});
    });
};

exports.post = function(req, res){
  res.app.db.models.User.findOne({username: req.body.receiver}, function(err, user){
    new res.app.db.models.Task({
      giver: req.user._id,
      receiver: user._id,
      content: req.body.task_content
    }).save(function(err, task){
      user.tasks.push(task._id);
      user.save(function(err, user){
        if (err)
          res.send(err);
        else
          res.send(task);
      });
    });
  });
};