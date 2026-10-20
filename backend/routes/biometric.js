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
        authenticatorAttachment: 'platform', // Enforce on-device biometric (TouchID, FaceID, Windows Hello, Android)
        userVerification: 'required',        // Must verify user with biometrics/PIN
        residentKey: 'preferred',
      },
    });

    user.currentChallenge = options.challenge;
    await user.save();

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

// 4. POST /api/auth/biometric/login-challenge (Public: generate authentication options)
router.post('/login-challenge', async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required for biometric sign-in.' });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ error: 'No account registered with this phone number.' });
    }

    if (!user.biometricCredentials || user.biometricCredentials.length === 0) {
      return res.status(400).json({
        error: 'Biometric unlock is not registered on this account yet. Please log in with PIN and enable it in Security Settings.'
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

    res.json({ options, phone: user.phone });
  } catch (error) {
    next(error);
  }
});

// 5. POST /api/auth/biometric/login-verify (Public: verify biometric signature and issue JWT)
router.post('/login-verify', async (req, res, next) => {
  try {
    const { phone, response } = req.body;
    if (!phone || !response) {
      return res.status(400).json({ error: 'Phone number and biometric response are required.' });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (!user.currentChallenge) {
      return res.status(400).json({ error: 'No active login challenge found. Please retry.' });
    }

    // Find the matching credential by credentialID
    const dbCred = (user.biometricCredentials || []).find(c => c.credentialID === response.id);
    if (!dbCred) {
      return res.status(400).json({ error: 'Unrecognized biometric credential for this account.' });
    }

    const { rpID, origin } = getWebAuthnContext(req);

    let verification;
    try {
      verification = await verifyAuthenticationResponse({
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
    } catch (verifyError) {
      console.error('[WebAuthn Login Error]:', verifyError.message);
      return res.status(400).json({ error: verifyError.message || 'Biometric authentication failed.' });
    }

    if (!verification.verified) {
      return res.status(400).json({ error: 'Biometric signature could not be verified.' });
    }

    // Update credential counter
    dbCred.counter = verification.authenticationInfo.newCounter;
    user.currentChallenge = null;
    await user.save();

    // Issue JWT token
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
