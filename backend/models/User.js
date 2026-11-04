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
    default: 0, // default balance is 0 for newly registered accounts
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
  pinLength: {
    type: Number,
    default: 4,
    min: 4,
    max: 6,
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
    corporateId: { type: String, default: '' },
    dob: { type: String, default: '' },
    gender: { type: String, default: '' },
    nid: { type: String, default: '' },
    tin: { type: String, default: '' },
    employer: { type: String, default: '' },
    employerShort: { type: String, default: '' },
    employerSubtitle: { type: String, default: '' },
    corporateEmail: { type: String, default: '' },
    employeeId: { type: String, default: '' },
    workstation: { type: String, default: '' },
    designation: { type: String, default: '' },
    department: { type: String, default: '' },
    officeAddress: { type: String, default: '' },
    corporateDirectLine: { type: String, default: '' },
    residentialAddress: { type: String, default: '' },
    permanentAddressMatches: { type: Boolean, default: true },
    emergencyContactName: { type: String, default: '' },
    emergencyContactRelation: { type: String, default: '' },
    emergencyContactPhone: { type: String, default: '' },
    salaryBank: { type: String, default: '' },
    salaryAccount: { type: String, default: '' },
    allowanceWallet: { type: String, default: '' },
    completionPercent: { type: Number, default: 0 }
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
