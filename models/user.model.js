var mongoose = require('mongoose');
var bcryptjs = require('bcrypt');

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    max: [32, 'Too long, max is 32 characters'],
    min: [4, 'Too short, max is 4 characters']
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    max: [32, 'Too long, max is 32 characters'],
    min: [4, 'Too short, max is 4 characters'],
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/]
  },
  password: {
    type: String,
    required: true,
    min: [4, 'Too short, min is 4 characters'],
    max: [32, 'Too long, max is 32 characters']
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

userSchema.pre('save', async function() {
  const salt = await bcryptjs.genSalt();
  const hash = await bcryptjs.hash(this.password, salt);
  this.password = hash;
});

module.exports = mongoose.model('User', userSchema);
