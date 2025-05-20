const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please enter your first name']
  },
  lastName: {
    type: String
  },
  email: {
    type: String,
    required: [true, 'Please enter your email address'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  userType: {
    type: String,
    enum: ['guest', 'host'],
    default: 'guest',
  },
  favourites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Home'
  }],
  bookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }]
});

module.exports = mongoose.model('User', userSchema);
