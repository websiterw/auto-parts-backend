const mongoose = require('mongoose');

const CommissionSchema = new mongoose.Schema({
  referrerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referredUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  level: { type: Number, required: true },           // 1,2,3
  percentage: { type: Number, required: true },      // 39%, 2%, 1%
  amount: { type: Number, required: true },
  investmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Investment' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Commission', CommissionSchema);