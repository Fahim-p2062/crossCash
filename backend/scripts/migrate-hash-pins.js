/**
 * Migration Script: migrate-hash-pins.js
 * 
 * Hashes existing plaintext PINs in MongoDB with bcryptjs (10 salt rounds).
 * Skips records where PIN is already hashed (e.g. starts with '$2a$', '$2b$', or '$2y$').
 * 
 * Usage:
 *   node scripts/migrate-hash-pins.js
 *   (or from repo root: node backend/scripts/migrate-hash-pins.js)
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/crosscash';

async function migratePins() {
  console.log('[Migration] Connecting to MongoDB at:', MONGO_URI);
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[Migration] Connected successfully.');

    // Query all users including pin (since select: false is set in schema)
    const users = await User.find({}).select('+pin');
    console.log(`[Migration] Found ${users.length} user record(s) to inspect.`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      if (!user.pin) {
        console.warn(`[Migration] User ID ${user._id} (${user.phone}) has no PIN. Skipping.`);
        skippedCount++;
        continue;
      }

      // Check if already a bcrypt hash ($2a$, $2b$, or $2y$, 60 characters)
      const isAlreadyBcrypt = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(user.pin);

      if (isAlreadyBcrypt) {
        skippedCount++;
      } else {
        const hashedPin = await bcrypt.hash(user.pin, 10);
        user.pin = hashedPin;
        await user.save();
        migratedCount++;
        console.log(`[Migration] Hashed PIN for user phone: ${user.phone}`);
      }
    }

    console.log('\n--- Migration Results ---');
    console.log(`Total inspected: ${users.length}`);
    console.log(`Migrated:        ${migratedCount}`);
    console.log(`Already hashed:  ${skippedCount}`);
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('[Migration Error]:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('[Migration] Disconnected from MongoDB.');
  }
}

migratePins();
