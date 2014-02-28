/**
 * [Require authorization] List all related tasks of current user
 * @return {Array} tasks
 */
exports.list = function(req, res){
  res.app.db.models.Task
    .find({
      $or:[
        { _id: {$in:req.user.tasks} },
        { giver: req.user._id }
      ]})
    .populate('giver receiver', 'fullname')
    .exec(function(err, tasks){
      res.send(tasks);
    });
};

/**
 * [Require authorization] Create new task
 * @param {String} receiver_id
 * @param {String} task_content
 * @return {JSON} task
 */
exports.post = function(req, res){
  new res.app.db.models.Task({
    giver: req.user._id,
    receiver: req.body.receiver_id,
    content: req.body.task_content
  }).save(function(err, task){
    res.app.db.models.User.update(
      { _id: req.body.receiver_id },
      { $push: {tasks:task._id} },
      function(err, numberAffected, raw){
        task.populate({
          path: 'giver receiver',
          select: 'fullname'
        }, function (err, task){
          res.send(task);
        })
      });
  });
};