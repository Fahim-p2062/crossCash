const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require('@simplewebauthn/server');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

// Helper to determine rpID and expected origin dynamically
function getWebAuthnContext(req) {
  const originHeader = req.get('origin') || req.get('referer');
  if (originHeader) {
    try {
      const url = new URL(originHeader);
      return {
        rpID: url.hostname,
        origin: `${url.protocol}//${url.host}`,
      };
    } catch (e) {
      // fallback if invalid URL
    }
  }

  // Fallback if no header
  const configuredOrigin = process.env.FRONTEND_ORIGIN && process.env.FRONTEND_ORIGIN !== '*'
    ? process.env.FRONTEND_ORIGIN
    : 'http://localhost:3000';

  try {
    const url = new URL(configuredOrigin);
    return {
      rpID: url.hostname,
      origin: configuredOrigin,
    };
  } catch (e) {
    return {
      rpID: 'localhost',
      origin: 'http://localhost:3000',
    };
  }
}

// Active challenges cache (challenge -> { phone, createdAt })
const activeChallenges = new Map();

function saveChallenge(challenge, phone = null) {
  activeChallenges.set(challenge, { phone, createdAt: Date.now() });
  const expiry = Date.now() - 5 * 60 * 1000;
  for (const [key, value] of activeChallenges.entries()) {
    if (value.createdAt < expiry) {
      activeChallenges.delete(key);
    }
  }
}

function consumeChallenge(challenge) {
  if (activeChallenges.has(challenge)) {
    const data = activeChallenges.get(challenge);
    activeChallenges.delete(challenge);
    return data;
  }
  return null;
}

// 1. GET /api/auth/biometric/status (Protected: check if user has biometrics enabled)
router.get('/status', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const hasBiometrics = Array.isArray(user.biometricCredentials) && user.biometricCredentials.length > 0;
    res.json({
      enabled: hasBiometrics,
      count: user.biometricCredentials?.length || 0,
      devices: user.biometricCredentials?.map(c => ({
        id: c.credentialID,
        deviceType: c.deviceType,
        createdAt: c.createdAt,
      })) || [],
    });
  } catch (error) {
    next(error);
  }
});

// 2. POST /api/auth/biometric/register-challenge (Protected: generate registration options)
router.post('/register-challenge', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { rpID } = getWebAuthnContext(req);

    // Exclude already registered credentials so the user doesn't register the same device twice
    const excludeCredentials = (user.biometricCredentials || []).map(cred => ({
      id: cred.credentialID,
      transports: cred.transports,
    }));

    const options = await generateRegistrationOptions({
      rpName: 'CrossCash Portal',
      rpID,
      userID: new TextEncoder().encode(user._id.toString()),
      userName: user.phone,
      userDisplayName: user.name,
      attestationType: 'none',
      excludeCredentials,
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'required', // creates a Discoverable Credential / Passkey
        requireResidentKey: true,
      },
    });

    user.currentChallenge = options.challenge;
    await user.save();
    saveChallenge(options.challenge, user.phone);

    res.json(options);
  } catch (error) {
    next(error);
  }
});

// 3. POST /api/auth/biometric/register-verify (Protected: verify registration response)
router.post('/register-verify', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.currentChallenge) {
      return res.status(400).json({ error: 'No active registration challenge found. Please retry.' });
    }

    const { rpID, origin } = getWebAuthnContext(req);

    let verification;
    try {
      verification = await verifyRegistrationResponse({
        response: req.body,
        expectedChallenge: user.currentChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
      });
    } catch (verifyError) {
      console.error('[WebAuthn Registration Error]:', verifyError.message);
      return res.status(400).json({ error: verifyError.message || 'Biometric verification failed.' });
    }

    if (!verification.verified || !verification.registrationInfo) {
      return res.status(400).json({ error: 'Biometric verification could not be validated.' });
    }

    const {
      credential: { id, publicKey, counter, transports },
      credentialDeviceType,
      credentialBackedUp,
    } = verification.registrationInfo;

    // Check if already registered
    const existingIndex = (user.biometricCredentials || []).findIndex(c => c.credentialID === id);
    if (existingIndex >= 0) {
      user.biometricCredentials[existingIndex] = {
        credentialID: id,
        credentialPublicKey: Buffer.from(publicKey),
        counter,
        transports: transports || ['internal'],
        deviceType: credentialDeviceType,
        backedUp: credentialBackedUp,
        createdAt: new Date(),
      };
    } else {
      user.biometricCredentials.push({
        credentialID: id,
        credentialPublicKey: Buffer.from(publicKey),
        counter,
        transports: transports || ['internal'],
        deviceType: credentialDeviceType,
        backedUp: credentialBackedUp,
        createdAt: new Date(),
      });
    }

    user.currentChallenge = null;
    await user.save();

    res.json({
      verified: true,
      message: 'Biometric unlock registered successfully!',
    });
  } catch (error) {
    next(error);
  }
});

// 4. POST /api/auth/biometric/login-challenge (Public: 1-Tap or targeted authentication)
router.post('/login-challenge', async (req, res, next) => {
  try {
    const { phone } = req.body || {};
    let allowCredentials = undefined;
    let targetUser = null;

    if (phone && typeof phone === 'string' && phone.trim()) {
      targetUser = await User.findOne({ phone: phone.trim() });
      if (targetUser && targetUser.biometricCredentials && targetUser.biometricCredentials.length > 0) {
        allowCredentials = targetUser.biometricCredentials.map(cred => ({
          id: cred.credentialID,
          transports: cred.transports,
        }));
      }
    }

    const { rpID } = getWebAuthnContext(req);

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials, // undefined allows 1-tap discoverable credentials (no phone needed!)
      userVerification: 'required',
    });

    saveChallenge(options.challenge, targetUser?.phone || null);
    if (targetUser) {
      targetUser.currentChallenge = options.challenge;
      await targetUser.save();
    }

    res.json({ options, challenge: options.challenge, phone: targetUser?.phone || null });
  } catch (error) {
    next(error);
  }
});

// 5. POST /api/auth/biometric/login-verify (Public: verify 1-tap or targeted biometric login)
router.post('/login-verify', async (req, res, next) => {
  try {
    const { phone, response, challenge } = req.body;
    if (!response || !response.id) {
      return res.status(400).json({ error: 'Biometric response is missing or invalid.' });
    }

    // 1. Locate user: either by phone or directly by the hardware credential ID
    let user = null;
    if (phone && typeof phone === 'string' && phone.trim()) {
      user = await User.findOne({ phone: phone.trim() });
    }
    
    if (!user) {
      user = await User.findOne({ "biometricCredentials.credentialID": response.id });
    }

    if (!user) {
      return res.status(404).json({
        error: 'No CrossCash account found for this biometric sensor. Please log in with PIN and enable Biometrics in Settings.'
      });
    }

    // 2. Resolve expected challenge
    let expectedChallenge = user.currentChallenge;
    if (!expectedChallenge && challenge && activeChallenges.has(challenge)) {
      expectedChallenge = challenge;
    }
    if (!expectedChallenge && activeChallenges.size > 0) {
      for (const [chKey] of activeChallenges.entries()) {
        expectedChallenge = chKey;
        break;
      }
    }

    if (!expectedChallenge) {
      return res.status(400).json({ error: 'No active login challenge found. Please try again.' });
    }

    // 3. Find matching hardware credential
    const dbCred = (user.biometricCredentials || []).find(c => c.credentialID === response.id);
    if (!dbCred) {
      return res.status(400).json({ error: 'Biometric credential is not recognized for this account.' });
    }

    const { rpID, origin } = getWebAuthnContext(req);

    let verification;
    try {
      verification = await verifyAuthenticationResponse({
        response,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        credential: {
          id: dbCred.credentialID,
          publicKey: dbCred.credentialPublicKey,
          counter: dbCred.counter,
          transports: dbCred.transports,
        },
      });
    } catch (verifyError) {
      console.error('[WebAuthn 1-Tap Login Error]:', verifyError.message);
      return res.status(400).json({ error: verifyError.message || 'Biometric authentication failed.' });
    }

    if (!verification.verified) {
      return res.status(400).json({ error: 'Biometric signature could not be verified.' });
    }

    // Clean up challenges & update counter
    consumeChallenge(expectedChallenge);
    dbCred.counter = verification.authenticationInfo.newCounter;
    user.currentChallenge = null;
    await user.save();

    // 4. Issue JWT token
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
        wallets: user.wallets,
      },
    });
  } catch (error) {
    next(error);
  }
});

// 6. POST /api/auth/biometric/remove (Protected: disable and remove credentials)
router.post('/remove', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.biometricCredentials = [];
    user.currentChallenge = null;
    await user.save();

    res.json({ success: true, message: 'Biometric credentials removed successfully.' });
  } catch (error) {
    next(error);
  }
});

// 7. POST /api/auth/biometric/authorize-challenge (Protected: challenge for transfer confirmation)
router.post('/authorize-challenge', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.biometricCredentials || user.biometricCredentials.length === 0) {
      return res.status(400).json({
        error: 'Biometric unlock is not registered. Please enable it in Security Settings.'
      });
    }

    const { rpID } = getWebAuthnContext(req);

    const allowCredentials = user.biometricCredentials.map(cred => ({
      id: cred.credentialID,
      transports: cred.transports,
    }));

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials,
      userVerification: 'required',
    });

    user.currentChallenge = options.challenge;
    await user.save();

    res.json(options);
  } catch (error) {
    next(error);
  }
});

// 8. POST /api/auth/biometric/authorize-verify (Protected: verify signature for transfer)
router.post('/authorize-verify', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.currentChallenge) {
      return res.status(400).json({ error: 'No active authorization challenge found.' });
    }

    const { response } = req.body;
    const dbCred = (user.biometricCredentials || []).find(c => c.credentialID === response?.id);
    if (!dbCred) {
      return res.status(400).json({ error: 'Unrecognized biometric credential.' });
    }

    const { rpID, origin } = getWebAuthnContext(req);

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: user.currentChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: dbCred.credentialID,
        publicKey: dbCred.credentialPublicKey,
        counter: dbCred.counter,
        transports: dbCred.transports,
      },
    });

    if (!verification.verified) {
      return res.status(400).json({ error: 'Biometric authorization failed.' });
    }

    dbCred.counter = verification.authenticationInfo.newCounter;
    user.currentChallenge = null;
    await user.save();

    res.json({ verified: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
