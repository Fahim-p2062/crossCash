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
    type: String,
  },
  senderName: {
    type: String,
    default: null,
  },
  senderPhone: {
    type: String,
    default: null,
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
    enum: ['Pending', 'Completed', 'Failed', 'completed', 'pending', 'failed'],
    default: 'Completed',
  },
  // 'p2p_transfer' | 'qr_payment' | 'add_funds' | 'swap'
  type: {
    type: String,
    default: 'p2p_transfer',
  },
  reference: {
    type: String,
    default: null,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
