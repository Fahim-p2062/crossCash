const express = require('express');
const router = express.Router();
const User = require('../models/User');

const Transaction = require('../models/Transaction');

// GET /api/user/:userId/balance
router.get('/:userId/balance', async (req, res, next) => {
  try {
    // IDOR protection: Verify that authenticated user matches requested userId
    if (req.params.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden. You do not have access to this resource.' });
    }

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Calculate total balance across all wallets
    const totalBalance = user.wallets.reduce((acc, wallet) => acc + wallet.balance, 0);
    
    res.json({
      totalBalance,
      wallets: user.wallets
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/user/:userId/add-funds
router.post('/:userId/add-funds', async (req, res, next) => {
  try {
    // IDOR protection
    if (req.params.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden. You do not have access to this resource.' });
    }

    const { amount, provider } = req.body;
    const depositAmount = Number(amount);
    if (!depositAmount || depositAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const targetProvider = provider || 'bKash';
    let wallet = user.wallets.find(w => w.provider === targetProvider);

    if (!wallet) {
      user.wallets.push({
        provider: targetProvider,
        identifier: user.phone,
        balance: depositAmount
      });
      wallet = user.wallets[user.wallets.length - 1];
    } else {
      wallet.balance = Math.round((wallet.balance + depositAmount) * 100) / 100;
    }

    await user.save();

    // Record an inbound transaction in the ledger
    const transaction = new Transaction({
      sender: user._id,
      recipientPhone: user.phone,
      recipientName: `${user.name} (Deposit)`,
      fromWalletProvider: 'Bank',
      toWalletProvider: targetProvider,
      amount: depositAmount,
      fee: 0,
      total: depositAmount,
      status: 'Completed'
    });
    await transaction.save();

    const totalBalance = user.wallets.reduce((acc, w) => acc + w.balance, 0);

    res.json({
      message: `Successfully added ৳${depositAmount.toLocaleString()} to ${targetProvider}`,
      totalBalance,
      wallets: user.wallets,
      transaction
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
