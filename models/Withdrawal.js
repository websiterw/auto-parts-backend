const mongoose = require('mongoose');

const WithdrawalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },          // gross amount
  fee: { type: Number, default: 0 },                 // 20% of amount
  netAmount: { type: Number, required: true },       // amount after fee
  bankDetails: { type: Object, required: true },     // { bank: "MTN", accountName: "...", accountNumber: "..." }
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  reference: String,
  createdAt: { type: Date, default: Date.now },
  processedAt: Date
});

module.exports = mongoose.model('Withdrawal', WithdrawalSchema);