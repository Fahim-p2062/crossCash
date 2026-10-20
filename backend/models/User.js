const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  provider: {
    type: String,
    enum: ['bKash', 'Nagad', 'Rocket', 'Bank'],
    required: true,
  },
  identifier: {
    type: String,
    required: true, // phone number or account number
  },
  balance: {
    type: Number,
    default: 10000, // mock balance for demo purposes
  }
});

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  pin: {
    type: String,
    required: true,
    select: false, // Never return PIN by default in queries
  },
  failedPinAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date,
    default: null,
  },
  biometricCredentials: [
    {
      credentialID: { type: String, required: true },
      credentialPublicKey: { type: Buffer, required: true },
      counter: { type: Number, default: 0 },
      transports: [String],
      deviceType: String,
      backedUp: Boolean,
      createdAt: { type: Date, default: Date.now },
    }
  ],
  currentChallenge: {
    type: String,
    default: null,
  },
  wallets: [walletSchema],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
