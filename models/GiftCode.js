const mongoose = require('mongoose');

const GiftCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  usedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  usedAt: Date,
  expiresAt: Date,
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('GiftCode', GiftCodeSchema);