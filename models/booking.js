const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  home: {
    type: Schema.Types.ObjectId,
    ref: 'Home',
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateFrom: Date,
  dateTo: Date,
  fullName: String,
  email: String,
  phone: String,
  nationality: String,
  cnic: String,
  passport: String,
  paymentMethod: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
