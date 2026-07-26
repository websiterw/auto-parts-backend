const mongoose = require('mongoose');

const PendingWithdrawalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  fee: { type: Number, default: 0 },
  netAmount: { type: Number, required: true },
  bankDetails: { type: Object, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  processedAt: Date
});

module.exports = mongoose.model('PendingWithdrawal', PendingWithdrawalSchema);