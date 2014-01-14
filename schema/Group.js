var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var groupSchema = new Schema({
	group_name: { type: String, required: true },
	users: [
		{
			_id: { type: Schema.Types.ObjectId, ref: 'users' },
			fullname: String,
      avatar: String
		}
	]
});

exports = module.exports = mongoose.model('groups', groupSchema);