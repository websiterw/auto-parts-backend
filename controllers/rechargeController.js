const PendingRecharge = require('../models/PendingRecharge');

exports.requestRecharge = async (req, res) => {
  try {
    const { amount, method, account } = req.body;
    const userId = req.user.id;
    if (!amount || amount < 6000) {
      return res.status(400).json({ msg: 'Minimum recharge is RWF 6,000' });
    }
    const pending = new PendingRecharge({ userId, amount, method, account, status: 'pending' });
    await pending.save();
    res.json({ msg: 'Recharge request submitted for approval.', pendingId: pending._id });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.getUserRecharges = async (req, res) => {
  try {
    const recharges = await PendingRecharge.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(recharges);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};