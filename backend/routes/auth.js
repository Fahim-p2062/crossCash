const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateBody, registerSchema, loginSchema } = require('../middleware/validation');

// POST /api/auth/register
router.post('/register', validateBody(registerSchema), async (req, res, next) => {
  try {
    const { phone, name, pin, provider } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash PIN before storing
    const hashedPin = await bcrypt.hash(pin, 10);

    // Create new user with their initial primary wallet (0 balance) and empty profile
    const user = new User({
      phone,
      name,
      pin: hashedPin,
      pinLength: pin.length,
      wallets: [
        {
          provider: provider || 'bKash',
          identifier: phone,
          balance: 0
        },
        ...(['bKash', 'Nagad', 'Rocket']
          .filter(p => p !== (provider || 'bKash'))
          .map(p => ({
            provider: p,
            identifier: phone,
            balance: 0
          }))
        )
      ],
      profile: {
        avatarUrl: '',
        corporateId: `CC-USER-${phone.slice(-6)}`,
        dob: '',
        gender: '',
        nid: '',
        tin: '',
        employer: '',
        employerShort: '',
        employerSubtitle: '',
        corporateEmail: '',
        employeeId: '',
        workstation: '',
        designation: '',
        department: '',
        officeAddress: '',
        corporateDirectLine: '',
        residentialAddress: '',
        permanentAddressMatches: true,
        emergencyContactName: '',
        emergencyContactRelation: '',
        emergencyContactPhone: '',
        salaryBank: '',
        salaryAccount: '',
        allowanceWallet: '',
        completionPercent: 0
      }
    });
    
    await user.save();
    
    // Generate JWT token containing only sub: userId
    const token = jwt.sign(
      { sub: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        pinLength: user.pinLength || pin.length,
        wallets: user.wallets
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', validateBody(loginSchema), async (req, res, next) => {
  try {
    const { phone, pin } = req.body;
    
    // Find user and explicitly select security fields (pin has select: false by default)
    const user = await User.findOne({ phone }).select('+pin +failedPinAttempts +lockUntil');
    if (!user) {
      // Generic message to avoid user enumeration
      return res.status(400).json({ error: 'Invalid phone or PIN' });
    }

    // Check if account is currently locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({ error: 'Account is temporarily locked. Please try again later.' });
    }
    
    // Compare PIN with bcrypt
    const isMatch = await bcrypt.compare(pin, user.pin);
    if (!isMatch) {
      user.failedPinAttempts = (user.failedPinAttempts || 0) + 1;

      // Lock account after 5 failed attempts for 15 minutes
      if (user.failedPinAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();
        return res.status(423).json({ error: 'Account is temporarily locked. Please try again later.' });
      }

      await user.save();
      // Generic message to avoid user enumeration
      return res.status(400).json({ error: 'Invalid phone or PIN' });
    }
    
    // Successful login: reset failed attempts counter and lockout
    let needsSave = false;
    if (user.failedPinAttempts > 0 || user.lockUntil) {
      user.failedPinAttempts = 0;
      user.lockUntil = null;
      needsSave = true;
    }

    if (!user.pinLength) {
      user.pinLength = pin.length;
      needsSave = true;
    }

    if (needsSave) {
      await user.save();
    }

    // Generate JWT token containing only sub: userId
    const token = jwt.sign(
      { sub: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        pinLength: user.pinLength || pin.length,
        wallets: user.wallets
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/pin-length/:phone
// Public helper to determine the exact PIN length configured for a phone number
router.get('/pin-length/:phone', async (req, res, next) => {
  try {
    const cleanPhone = (req.params.phone || '').replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 11) {
      return res.json({ pinLength: 4 });
    }
    const user = await User.findOne({ phone: cleanPhone }).select('pinLength');
    res.json({ pinLength: user ? (user.pinLength || 4) : 4 });
  } catch (error) {
    res.json({ pinLength: 4 });
  }
});

module.exports = router;
