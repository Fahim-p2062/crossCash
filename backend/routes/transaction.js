const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
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
      recipientName,
      pin
    } = req.body;

    // Derive sender strictly from authenticated token
    const senderId = req.user.id;
    const sender = await User.findById(senderId).select('+pin +failedPinAttempts +lockUntil');
    if (!sender) return res.status(404).json({ error: 'Sender not found' });

    // Verify PIN if provided
    if (pin) {
      if (sender.lockUntil && sender.lockUntil > Date.now()) {
        return res.status(423).json({ error: 'Account is temporarily locked due to failed attempts. Please try again later.' });
      }
      const isPinMatch = await bcrypt.compare(pin, sender.pin);
      if (!isPinMatch) {
        sender.failedPinAttempts = (sender.failedPinAttempts || 0) + 1;
        if (sender.failedPinAttempts >= 5) {
          sender.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
          await sender.save();
          return res.status(423).json({ error: 'Account is temporarily locked due to multiple incorrect PIN attempts.' });
        }
        await sender.save();
        return res.status(400).json({ error: 'Incorrect PIN. Transfer not authorized.' });
      }
      if (sender.failedPinAttempts > 0) {
        sender.failedPinAttempts = 0;
      }
    }
    
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

    // Check if recipient is a registered CrossCash user
    const cleanRecipientPhone = recipientPhone.replace(/[^0-9]/g, '');
    const cleanSenderPhone = sender.phone.replace(/[^0-9]/g, '');
    const isSelfTransfer = (cleanSenderPhone === cleanRecipientPhone);

    let recipient = isSelfTransfer
      ? sender
      : await User.findOne({ phone: cleanRecipientPhone });

    if (!recipient) {
      return res.status(400).json({
        error: `User ${recipientPhone} has no account on CrossCash. Transfers are revoked for unregistered users.`
      });
    }

    const resolvedRecipientName = isSelfTransfer ? `${sender.name} (Self Swap)` : recipient.name;
    let recipientWallet = recipient.wallets.find(w => w.provider.toLowerCase() === toWalletProvider.toLowerCase());
    if (!recipientWallet) {
      recipient.wallets.push({
        provider: toWalletProvider,
        identifier: cleanRecipientPhone,
        balance: amount
      });
      recipientWallet = recipient.wallets[recipient.wallets.length - 1];
    } else {
      recipientWallet.balance = Math.round((recipientWallet.balance + amount) * 100) / 100;
    }

    if (isSelfTransfer) {
      sender.markModified('wallets');
      await sender.save();
    } else {
      sender.markModified('wallets');
      await sender.save();
      recipient.markModified('wallets');
      await recipient.save();
    }

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

    const senderTotalBalance = Math.round(sender.wallets.reduce((acc, w) => acc + (Number(w.balance) || 0), 0) * 100) / 100;
    
    res.status(200).json({ 
      message: 'Transfer successful', 
      transaction,
      senderWalletBalance: senderWallet.balance,
      senderTotalBalance,
      wallets: sender.wallets
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
