const mongoose = require('mongoose');

const PendingRechargeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  method: { type: String, required: true },          // 'MTN' or 'Airtel' (the user's payment method)
  depositBank: { type: String, required: true },     // 'MTN' or 'Airtel' (the admin bank they are paying to)
  account: { type: String, default: '' },            // user's phone number
  holderName: { type: String, default: '' },         // NEW: user's account holder name
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  processedAt: Date
});

module.exports = mongoose.model('PendingRecharge', PendingRechargeSchema);
