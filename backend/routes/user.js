const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/user/:userId/balance
router.get('/:userId/balance', async (req, res) => {
  try {
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
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
