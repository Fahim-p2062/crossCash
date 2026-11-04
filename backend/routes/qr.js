const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { parseBanglaQR, generateSampleQR } = require('../lib/qrParser');
const { verifyToken } = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

/**
 * POST /api/qr/parse
 * Accepts a raw QR string, returns structured merchant payment info.
 * Protected: requires valid JWT (verifyToken applied in index.js).
 */
router.post('/parse', async (req, res, next) => {
  try {
    const { rawQR } = req.body;
    if (!rawQR || typeof rawQR !== 'string' || rawQR.trim().length < 10) {
      return res.status(400).json({ error: 'Invalid QR payload provided.' });
    }

    const parsed = parseBanglaQR(rawQR.trim());
    if (!parsed.isValid) {
      return res.status(422).json({ error: parsed.error || 'QR code is not a valid Bangla QR payment code.' });
    }

    return res.json({
      isValid: true,
      isDynamic: parsed.isDynamic,
      merchantName: parsed.merchantName || 'Unknown Merchant',
      merchantCity: parsed.merchantCity || 'Bangladesh',
      merchantCategoryCode: parsed.merchantCategoryCode,
      currency: parsed.transactionCurrency,
      amount: parsed.transactionAmount,
      countryCode: parsed.countryCode,
      provider: parsed.merchantAccountInfo?.provider || 'Unknown',
      merchantId: parsed.merchantAccountInfo?.merchantId || null,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/qr/pay
 * Execute a QR-based P2M (Person-to-Merchant) payment.
 * Body: { rawQR, amount, fromWalletProvider, pin }
 */
router.post('/pay', verifyToken, async (req, res, next) => {
  try {
    const { rawQR, amount, fromWalletProvider, pin } = req.body;

    if (!rawQR || !amount || !fromWalletProvider) {
      return res.status(400).json({ error: 'rawQR, amount, and fromWalletProvider are required.' });
    }
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number.' });
    }

    // Parse QR
    const parsed = parseBanglaQR(rawQR.trim());
    if (!parsed.isValid) {
      return res.status(422).json({ error: 'Invalid Bangla QR code.' });
    }

    // Load sender
    const senderId = req.user.id;
    const sender = await User.findById(senderId).select('+pin +failedPinAttempts +lockUntil');
    if (!sender) return res.status(404).json({ error: 'Sender account not found.' });

    // PIN check
    if (pin) {
      if (sender.lockUntil && sender.lockUntil > Date.now()) {
        return res.status(423).json({ error: 'Account temporarily locked. Please try again later.' });
      }
      const isPinMatch = await bcrypt.compare(pin, sender.pin);
      if (!isPinMatch) {
        sender.failedPinAttempts = (sender.failedPinAttempts || 0) + 1;
        if (sender.failedPinAttempts >= 5) {
          sender.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
          await sender.save();
          return res.status(423).json({ error: 'Account temporarily locked due to multiple failed attempts.' });
        }
        await sender.save();
        return res.status(400).json({ error: 'Incorrect PIN. Payment not authorized.' });
      }
      if (sender.failedPinAttempts > 0) {
        sender.failedPinAttempts = 0;
      }
    }

    // Find sender wallet
    const senderWallet = sender.wallets.find(w => w.provider === fromWalletProvider)
      || sender.wallets[0];
    if (!senderWallet) {
      return res.status(400).json({ error: `No ${fromWalletProvider} wallet found on your account.` });
    }

    const payAmount = Math.round(Number(amount) * 100) / 100;
    // No CrossCash interop fee for P2M merchant payments
    const fee = 0;
    const total = payAmount;

    if (senderWallet.balance < total) {
      return res.status(400).json({
        error: `Insufficient balance. Available: ৳${senderWallet.balance.toFixed(2)}, Required: ৳${total.toFixed(2)}`
      });
    }

    const merchantName = parsed.merchantName || 'QR Merchant';
    const merchantId = parsed.merchantAccountInfo?.merchantId || 'MERCHANT';

    // Deduct from sender wallet
    senderWallet.balance = Math.round((senderWallet.balance - total) * 100) / 100;
    sender.markModified('wallets');
    await sender.save();

    // Record transaction
    const tx = await Transaction.create({
      sender: sender._id,
      senderName: sender.name,
      senderPhone: sender.phone,
      recipientPhone: merchantId,
      recipientName: merchantName,
      fromWalletProvider,
      toWalletProvider: parsed.merchantAccountInfo?.provider || 'Merchant',
      amount: payAmount,
      fee,
      total,
      type: 'qr_payment',
      status: 'completed',
      reference: `QR-${Date.now()}`,
      metadata: {
        merchantCity: parsed.merchantCity,
        merchantCategoryCode: parsed.merchantCategoryCode,
        isDynamic: parsed.isDynamic,
        currency: parsed.transactionCurrency,
      },
    });

    return res.json({
      message: 'QR Payment successful!',
      transaction: tx,
      senderWalletBalance: senderWallet.balance,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/qr/sample
 * Returns sample Bangla QR payloads for testing (static and dynamic).
 */
router.get('/sample', (req, res) => {
  res.json({
    static: generateSampleQR({
      merchantName: 'CrossCash Demo Shop',
      merchantCity: 'Dhaka',
      merchantId: 'DEMO001',
      amount: null,
    }),
    dynamic: generateSampleQR({
      merchantName: 'BDFood Restaurant',
      merchantCity: 'Chittagong',
      merchantId: 'FOOD002',
      amount: 850.00,
    }),
  });
});

module.exports = router;

