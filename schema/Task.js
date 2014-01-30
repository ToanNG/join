var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var taskSchema = new Schema({
  giver: { type: Schema.Types.ObjectId, ref: 'users' },
  content: { type: String, required: true },
  status: { type: Boolean, default: false }
});

exports = module.exports = mongoose.model('tasks', taskSchema);