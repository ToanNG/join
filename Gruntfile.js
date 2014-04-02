var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost/join_development');

var User = require('./app/schemas/User'),
  Group = require('./app/schemas/Group'),
  Task = require('./app/schemas/Task');

module.exports = function(grunt) {
  grunt.registerTask('db-reset', function() {
    //invoke async mode
    var done = this.async();

    User.collection.remove(function() {
      console.log("Empty users collection");

      Group.collection.remove(function() {
        console.log("Empty groups collection");

        Task.collection.remove(function() {
          console.log("Empty tasks collection");          
          done();
        });
      });
    });
  });

  grunt.registerTask('db-seed', function() {
    var done = this.async();

    User.create(require('./samples/users-data.json'))
    .then(
      function() {
        for (var i=1; i<arguments.length; ++i) {
          var user = arguments[i];
          console.log(user);
        }
        return Group.create(require('./samples/groups-data.json'));
      },
      function(err) {
        console.log('Error: '+err.err);
        done(false);
    })
    .then(
      function() {
        console.log('Inserted all groups');
        return Task.create(require('./samples/tasks-data.json'));
      },
      function(err) {
        console.log('Error: '+err.err);
        done(false);
    })
    .then(
      function() {
        console.log('Inserted all tasks');
        done();
      },
      function(err) {
        console.log('Error: '+err.err);
        done(false);
    });
  });
};