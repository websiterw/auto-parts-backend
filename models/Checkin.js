const mongoose = require('mongoose');

const CheckinSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  reward: { type: Number, default: 100 }             // 100 RWF per check-in
});

// Ensure one check-in per user per day
CheckinSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Checkin', CheckinSchema);