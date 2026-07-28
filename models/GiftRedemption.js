const mongoose = require('mongoose');

const GiftRedemptionSchema = new mongoose.Schema({
  giftCodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'GiftCode', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  redeemedAt: { type: Date, default: Date.now }
});

// Ensure a user can redeem a specific gift code only once
GiftRedemptionSchema.index({ giftCodeId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('GiftRedemption', GiftRedemptionSchema);
