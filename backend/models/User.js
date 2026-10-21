const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  provider: {
    type: String,
    enum: ['bKash', 'Nagad', 'Rocket', 'Bank'],
    required: true,
  },
  identifier: {
    type: String,
    required: true, // phone number or account number
  },
  balance: {
    type: Number,
    default: 10000, // mock balance for demo purposes
  }
});

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  pin: {
    type: String,
    required: true,
    select: false, // Never return PIN by default in queries
  },
  failedPinAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date,
    default: null,
  },
  biometricCredentials: [
    {
      credentialID: { type: String, required: true },
      credentialPublicKey: { type: Buffer, required: true },
      counter: { type: Number, default: 0 },
      transports: [String],
      deviceType: String,
      backedUp: Boolean,
      createdAt: { type: Date, default: Date.now },
    }
  ],
  currentChallenge: {
    type: String,
    default: null,
  },
  wallets: [walletSchema],
  profile: {
    avatarUrl: { type: String, default: '' },
    corporateId: { type: String, default: 'CC-CORP-885053' },
    dob: { type: String, default: '14 Aug 1994' },
    gender: { type: String, default: 'Male' },
    nid: { type: String, default: '1994 2692 8110 0041' },
    tin: { type: String, default: '4821-9903-XXXX' },
    employer: { type: String, default: 'Standard Chartered GBS' },
    employerShort: { type: String, default: 'SCB' },
    employerSubtitle: { type: String, default: 'Global Business Services Ltd.' },
    corporateEmail: { type: String, default: 'fahim.zaman@scb.com' },
    employeeId: { type: String, default: 'SCB-EMP-90241' },
    workstation: { type: String, default: 'Dhaka HQ' },
    designation: { type: String, default: 'Senior Financial Systems Architect' },
    department: { type: String, default: 'Fintech Operations & Real-time Settlements' },
    officeAddress: { type: String, default: 'Gulshan 2, Dhaka 1212, Bangladesh' },
    corporateDirectLine: { type: String, default: '+880 2 988-1234 (Ext 402)' },
    residentialAddress: { type: String, default: 'House 42, Road 11, Block D, Banani, Dhaka 1213' },
    permanentAddressMatches: { type: Boolean, default: true },
    emergencyContactName: { type: String, default: 'Dr. Anisur Zaman' },
    emergencyContactRelation: { type: String, default: 'Father' },
    emergencyContactPhone: { type: String, default: '+880 1711-000000' },
    salaryBank: { type: String, default: 'City Bank Corporate' },
    salaryAccount: { type: String, default: '•••• 4892 (Gulshan Br.)' },
    allowanceWallet: { type: String, default: 'bKash Corp Pocket' },
    completionPercent: { type: Number, default: 85 }
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
