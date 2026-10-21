const express = require('express');
const router = express.Router();
const User = require('../models/User');

const Transaction = require('../models/Transaction');

// GET /api/user/suggestions?q=... (Typeahead suggestions for recipient search)
router.get('/suggestions', async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q || q.length < 2) return res.json([]);
    const cleanQ = q.replace(/[^0-9a-zA-Z]/g, '');
    const users = await User.find({
      $or: [
        { phone: { $regex: cleanQ, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } }
      ],
      _id: { $ne: req.user.id }
    }).select('name phone wallets').limit(6);

    res.json(users.map(u => ({
      id: u._id,
      name: u.name,
      phone: u.phone,
      wallets: (u.wallets || []).map(w => w.provider)
    })));
  } catch (error) {
    next(error);
  }
});

// GET /api/user/lookup/:phone (Verify if a recipient exists on CrossCash)
router.get('/lookup/:phone', async (req, res, next) => {
  try {
    const cleanPhone = req.params.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 11) {
      return res.status(400).json({ error: 'Phone number must be at least 11 digits' });
    }

    const foundUser = await User.findOne({ phone: cleanPhone }).select('name phone wallets');
    if (!foundUser) {
      return res.status(404).json({
        exists: false,
        message: 'User has no account on CrossCash. Transfers are only allowed between registered CrossCash users.'
      });
    }

    res.json({
      exists: true,
      user: {
        name: foundUser.name,
        phone: foundUser.phone,
        wallets: (foundUser.wallets || []).map(w => w.provider)
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/user/profile (Fetch authenticated user's MNC profile details)
router.get('/profile', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-pin');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      _id: user._id,
      id: user._id,
      name: user.name,
      phone: user.phone,
      profile: user.profile || {}
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/user/profile (Update authenticated user's MNC profile details)
router.put('/profile', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { name, profile } = req.body;
    if (name && typeof name === 'string' && name.trim()) {
      user.name = name.trim();
    }

    if (profile && typeof profile === 'object') {
      const currentProfile = user.profile && typeof user.profile.toObject === 'function'
        ? user.profile.toObject()
        : (user.profile || {});

      user.profile = {
        ...currentProfile,
        ...profile
      };
      user.markModified('profile');
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        phone: user.phone,
        profile: user.profile
      }
    });
  } catch (error) {
    next(error);
  }
});

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
