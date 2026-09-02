const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { phone, name, pin, provider } = req.body;
    
    // Check if user exists
    let user = await User.findOne({ phone });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Create new user with their primary wallet
    user = new User({
      phone,
      name,
      pin, // In a real app, hash this PIN
      wallets: [
        {
          provider: provider || 'bKash',
          identifier: phone,
          balance: 10000 // mock initial balance
        }
      ]
    });
    
    await user.save();
    
    res.status(201).json({ message: 'User registered successfully', userId: user._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { phone, pin } = req.body;
    
    // Find user
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ error: 'Invalid phone or PIN' });
    }
    
    // Check PIN (mock validation, should be bcrypt.compare)
    if (user.pin !== pin) {
      return res.status(400).json({ error: 'Invalid phone or PIN' });
    }
    
    // In a real app, generate JWT here
    res.json({
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

module.exports = router;
