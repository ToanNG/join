exports = module.exports = function(app) {
	app.db.models.User = require('./schema/User');
	app.db.models.Group = require('./schema/Group');
};