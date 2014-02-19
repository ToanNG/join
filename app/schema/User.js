var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  validate = require('mongoose-validator').validate,
	bcrypt = require('bcrypt'),
  SALT_WORK_FACTOR = 10;

var userSchema = new Schema({
  username: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: false },
  fullname: { type: String, required: true },
  facebook_id: { type: String, required: false },
  avatar: String,
  created_at: { type: Date, default: Date.now },
  groups: [{ type: Schema.Types.ObjectId, ref: 'groups' }],
  tasks: [{ type: Schema.Types.ObjectId, ref: 'tasks' }]
}, { autoIndex: true });

userSchema.methods.validPassword = function(password){
	return bcrypt.compareSync(password, this.password);
};

userSchema.pre('save', function(next) {
  var user = this;

  //only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();

  //generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err);

    //hash the password along with our new salt
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);

      //override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  });
});

//app.db.model('users', userSchema);
exports = module.exports = mongoose.model('users', userSchema);