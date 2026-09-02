const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// POST /api/transactions/transfer
router.post('/transfer', async (req, res) => {
  try {
    const { 
      senderId, 
      recipientPhone, 
      fromWalletProvider, 
      toWalletProvider, 
      amount 
    } = req.body;
    
    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    const sender = await User.findById(senderId);
    if (!sender) return res.status(404).json({ error: 'Sender not found' });
    
    // Find recipient
    const recipient = await User.findOne({ phone: recipientPhone });
    if (!recipient) return res.status(404).json({ error: 'Recipient not found on CrossCash' });

    // Check sender balance in the selected wallet
    const senderWallet = sender.wallets.find(w => w.provider === fromWalletProvider);
    if (!senderWallet) return res.status(400).json({ error: 'Sender wallet not found' });
    
    // Calculate fee (e.g., 1% interoperability fee)
    const fee = amount * 0.01;
    const total = amount + fee;
    
    if (senderWallet.balance < total) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    // Check recipient wallet
    const recipientWallet = recipient.wallets.find(w => w.provider === toWalletProvider);
    if (!recipientWallet) return res.status(400).json({ error: 'Recipient does not have the specified wallet connected' });

    // Deduct from sender
    senderWallet.balance -= total;
    await sender.save();
    
    // Add to recipient
    recipientWallet.balance += amount;
    await recipient.save();

    // Create transaction record
    const transaction = new Transaction({
      sender: sender._id,
      recipientPhone,
      recipientName: recipient.name,
      fromWalletProvider,
      toWalletProvider,
      amount,
      fee,
      total,
      status: 'Completed'
    });
    
    await transaction.save();
    
    res.status(200).json({ message: 'Transfer successful', transaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during transfer' });
  }
});

// GET /api/transactions/:userId
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Find transactions where the user is either the sender or the recipient (by phone)
    const transactions = await Transaction.find({
      $or: [
        { sender: user._id },
        { recipientPhone: user.phone }
      ]
    }).sort({ createdAt: -1 });
    
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
