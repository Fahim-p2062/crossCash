const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipientPhone: {
    type: String,
    required: true,
  },
  recipientName: {
    type: String, // We can resolve this before creating the transaction or default to 'Unknown'
  },
  fromWalletProvider: {
    type: String,
    required: true,
  },
  toWalletProvider: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  fee: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Completed',
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
