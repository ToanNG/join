exports = module.exports = function(app) {
  app.db.models.User = require('./schemas/User');
  app.db.models.Group = require('./schemas/Group');
  app.db.models.Task = require('./schemas/Task');
};