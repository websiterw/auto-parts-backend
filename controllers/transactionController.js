const Transaction = require('../models/Transaction');

exports.getUserTransactions = async (req, res) => {
  try {
    const txs = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(txs);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};