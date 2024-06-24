const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the User schema
const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  reset_token: {
    type: String,
    default: null
  },
  uploaded: {
    type: Array,
    default: []
  },
  sharedWithMe: {
    type: Array,
    default: []
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verification_token: {
    type: String,
    default: null
  }
});

// Create and export the User model
module.exports = mongoose.model('users', UserSchema);
