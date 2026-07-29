const mongoose = require('mongoose');

const InvestmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: String,
  price: Number,
  dailyIncome: Number,
  totalIncome: Number,
  termDays: Number,
  purchasedAt: { type: Date, default: Date.now },
  daysRemaining: { type: Number, default: 0 },
  totalReceived: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  lastIncomeDate: { type: Date, default: Date.now } // <-- CRITICAL
});

module.exports = mongoose.model('Investment', InvestmentSchema);
