const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  accountNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  invitationCode: { type: String, default: '' },
  myReferralCode: { type: String, unique: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  balance: { type: Number, default: 0 },
  bonusBalance: { type: Number, default: 0 }, // non-withdrawable bonus (registration)
  cumulativeIncome: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  checkinDays: { type: Number, default: 0 },
  lastCheckinDate: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);