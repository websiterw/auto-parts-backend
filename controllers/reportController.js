const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Withdrawal = require('../models/Withdrawal');
const Investment = require('../models/Investment');

exports.daily = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const pipeline = [
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } }
    ];
    const report = await Transaction.aggregate(pipeline);
    res.json(report);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.weekly = async (req, res) => {
  // similar, just adjust date range
  res.json({ msg: 'Weekly report' });
};

exports.monthly = async (req, res) => {
  res.json({ msg: 'Monthly report' });
};