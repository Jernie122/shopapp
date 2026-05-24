const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
  role: {
    type: String,
    enum: ['buyer', 'seller', 'admin'],
    default: 'buyer'
  },
  avatar: {
    type: String,
    default: ''
  },
  isSuspended: {
    type: Boolean,
    default: false
  },
  storeName: {
    type: String,
    default: ''
  },
  storeDescription: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);