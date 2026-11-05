const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    enum: ['high_value_transfer', 'pin_change', 'general'],
    default: 'high_value_transfer',
  },
  verified: {
    type: Boolean,
    default: false,
  },
  token: {
    type: String,
    default: null,
    index: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 180, // TTL index: document will automatically self-destruct after 180 seconds (3 minutes)
  },
});

module.exports = mongoose.model('OTP', otpSchema);
