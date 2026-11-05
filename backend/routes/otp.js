const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const OTP = require('../models/OTP');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');
const { sendSMS } = require('../lib/sms');

/**
 * POST /api/otp/send
 * Dispatch a 6-digit verification OTP.
 * Body: { purpose: 'high_value_transfer' | 'pin_change', amount?: number, phone?: string }
 */
router.post('/send', verifyToken, async (req, res, next) => {
  try {
    const { purpose = 'high_value_transfer', amount } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const phone = user.phone;

    // Invalidate existing active OTPs for same phone and purpose
    await OTP.deleteMany({ phone, purpose, verified: false });

    // Generate secure 6-digit code
    const otpCode = (crypto.randomInt(100000, 999999)).toString();

    // Save in MongoDB with 180s TTL
    await OTP.create({
      phone,
      otp: otpCode,
      purpose,
    });

    let smsText = `Your CrossCash security OTP is ${otpCode}. Valid for 3 minutes. Never share this code with anyone.`;
    if (purpose === 'high_value_transfer' && amount) {
      smsText = `CrossCash Security Alert: Your 2FA OTP for high-value transfer of ৳${Number(amount).toLocaleString()} is ${otpCode}. Valid for 3 mins. Do not share.`;
    } else if (purpose === 'pin_change') {
      smsText = `CrossCash Security: Your PIN reset authorization OTP is ${otpCode}. Valid for 3 mins. If you did not request this, contact support immediately.`;
    }

    // Send SMS
    const smsResult = await sendSMS(phone, smsText);

    const maskedPhone = `+880 ${phone.slice(0, 3)}••••${phone.slice(-3)}`;

    return res.json({
      message: `Security OTP sent to ${maskedPhone}`,
      phone: maskedPhone,
      expiresIn: 180,
      gateway: smsResult.gateway,
      demoOtp: otpCode, // Provided for live presentation and testing
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/otp/verify
 * Validate the 6-digit OTP code and issue an authorization token.
 * Body: { otp: string, purpose: 'high_value_transfer' | 'pin_change' }
 */
router.post('/verify', verifyToken, async (req, res, next) => {
  try {
    const { otp, purpose = 'high_value_transfer' } = req.body;
    if (!otp || typeof otp !== 'string' || otp.trim().length !== 6) {
      return res.status(400).json({ error: 'Please enter a valid 6-digit OTP code.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const phone = user.phone;

    // Find the latest active OTP record
    const record = await OTP.findOne({ phone, purpose, verified: false }).sort({ createdAt: -1 });

    if (!record) {
      return res.status(400).json({
        error: 'OTP has expired or was not requested. Please request a new code.',
      });
    }

    if (record.attempts >= 3) {
      await OTP.deleteOne({ _id: record._id });
      return res.status(429).json({
        error: 'Too many incorrect attempts. Please request a fresh OTP code.',
      });
    }

    if (record.otp !== otp.trim()) {
      record.attempts += 1;
      await record.save();
      const remaining = 3 - record.attempts;
      return res.status(400).json({
        error: `Incorrect OTP code. You have ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
      });
    }

    // OTP Verified! Generate secure authorization token
    const token = crypto.randomBytes(24).toString('hex');
    record.verified = true;
    record.token = token;
    await record.save();

    return res.json({
      message: 'OTP verified successfully.',
      verified: true,
      otpToken: token,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
