var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var groupSchema = new Schema({
	group_name: { type: String, required: true },
	users: [{ type: Schema.Types.ObjectId, ref: 'users' }]
});

exports = module.exports = mongoose.model('groups', groupSchema);