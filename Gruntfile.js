var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/join_development');

var User = require('./schema/User'),
  Group = require('./schema/Group');

module.exports = function(grunt) {
  grunt.registerTask('db-reset', function() {
    // Invoke async mode
    var done = this.async();

    User.collection.remove(function() {
      console.log("Empty users collection");

      Group.collection.remove(function() {
        console.log("Empty groups collection");
        done();
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
          console.log('Inserted user '+user.username);
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
        done();
      }
    );
  });
};