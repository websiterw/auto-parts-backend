const mongoose = require('mongoose');

const PendingRechargeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  method: { type: String, required: true },
  account: { type: String, default: '' },
  holderName: { type: String, default: '' }, // <-- NEW
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  processedAt: Date
});

module.exports = mongoose.model('PendingRecharge', PendingRechargeSchema);
