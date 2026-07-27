const mongoose = require('mongoose');

const GiftCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  // Optional fixed amount (for backward compatibility)
  amount: {
    type: Number,
    default: 0
  },
  // New random range fields
  minAmount: {
    type: Number,
    default: 0
  },
  maxAmount: {
    type: Number,
    default: 0
  },
  usedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  usedAt: {
    type: Date
  },
  expiresAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('GiftCode', GiftCodeSchema);