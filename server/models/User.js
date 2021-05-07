const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create schema
const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  },
  superpower: {
    type: String
  },
  timezone: {
    type: String
  }
})

module.exports = User = mongoose.model('users', UserSchema)
// in mongodb, the collection will be called 'users' but in the
// exports it is called 'User"