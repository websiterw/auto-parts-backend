const mongoose = require('mongoose');

const PendingRechargeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  method: { type: String, required: true }, // admin's bank (MTN or Airtel)
  userMethod: { type: String, required: true }, // user's payment method (MTN or Airtel)
  account: { type: String, default: '' }, // user's phone number
  holderName: { type: String, default: '' }, // user's account holder name
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  processedAt: Date
});

module.exports = mongoose.model('PendingRecharge', PendingRechargeSchema);
