const GiftCode = require('../models/GiftCode');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

exports.redeem = async (req, res) => {
  try {
    const { code } = req.body;
    const gift = await GiftCode.findOne({ code, isActive: true });
    if (!gift) return res.status(400).json({ msg: 'Invalid or expired code' });

    const user = await User.findById(req.user.id);
    user.balance += gift.amount;
    user.cumulativeIncome += gift.amount;
    await user.save();

    gift.isActive = false;
    gift.usedBy = req.user.id;
    gift.usedAt = new Date();
    await gift.save();

    await new Transaction({
      userId: req.user.id,
      type: 'gift',
      amount: gift.amount,
      description: 'Gift code redemption'
    }).save();

    res.json({ msg: 'Gift redeemed', balance: user.balance });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};