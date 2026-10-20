const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { validateBody, transferSchema } = require('../middleware/validation');

// POST /api/transactions/transfer
router.post('/transfer', validateBody(transferSchema), async (req, res, next) => {
  try {
    const { 
      recipientPhone, 
      fromWalletProvider, 
      toWalletProvider, 
      amount,
      recipientName 
    } = req.body;

    // Derive sender strictly from authenticated token
    const senderId = req.user.id;
    const sender = await User.findById(senderId);
    if (!sender) return res.status(404).json({ error: 'Sender not found' });
    
    // Find sender wallet
    let senderWallet = sender.wallets.find(w => w.provider === fromWalletProvider);
    if (!senderWallet && sender.wallets.length > 0) {
      // Fallback to sender's first available wallet if provider not explicitly found
      senderWallet = sender.wallets[0];
    }
    if (!senderWallet) {
      return res.status(400).json({ error: `No active ${fromWalletProvider} wallet found for your account.` });
    }
    
    // Calculate 1% fee and total
    const fee = Math.round((amount * 0.01) * 100) / 100;
    const total = Math.round((amount + fee) * 100) / 100;
    
    if (senderWallet.balance < total) {
      return res.status(400).json({ 
        error: `Insufficient balance in ${senderWallet.provider} wallet. Current balance: ৳${senderWallet.balance.toFixed(2)}, required: ৳${total.toFixed(2)}.` 
      });
    }

    // Deduct from sender wallet
    senderWallet.balance = Math.round((senderWallet.balance - total) * 100) / 100;
    sender.markModified('wallets');
    await sender.save();

    // Check if recipient is a registered CrossCash user
    const recipient = (sender.phone === recipientPhone)
      ? sender
      : await User.findOne({ phone: recipientPhone });

    if (!recipient) {
      return res.status(400).json({
        error: `User ${recipientPhone} has no account on CrossCash. Transfers are revoked for unregistered users.`
      });
    }

    const resolvedRecipientName = recipient.name;
    let recipientWallet = recipient.wallets.find(w => w.provider === toWalletProvider);
    if (!recipientWallet) {
      recipient.wallets.push({
        provider: toWalletProvider,
        identifier: recipientPhone,
        balance: amount
      });
    } else {
      recipientWallet.balance = Math.round((recipientWallet.balance + amount) * 100) / 100;
    }
    recipient.markModified('wallets');
    await recipient.save();

    // Save transaction ledger in MongoDB
    const transaction = new Transaction({
      sender: sender._id,
      recipientPhone,
      recipientName: resolvedRecipientName,
      fromWalletProvider: senderWallet.provider,
      toWalletProvider,
      amount,
      fee,
      total,
      status: 'Completed'
    });
    
    await transaction.save();
    
    res.status(200).json({ 
      message: 'Transfer successful', 
      transaction,
      senderWalletBalance: senderWallet.balance
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/transactions/:userId
router.get('/:userId', async (req, res, next) => {
  try {
    // IDOR Protection: Ensure authenticated user matches requested userId
    if (req.params.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden. You do not have access to this resource.' });
    }

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
    next(error);
  }
});

module.exports = router;
