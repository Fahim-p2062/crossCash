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
  },
  name: {
    type: String,
    required: true,
  },
  pin: {
    type: String, // Hashed PIN in real app, plain for demo if needed, but best practice is hash
    required: true,
  },
  wallets: [walletSchema],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
