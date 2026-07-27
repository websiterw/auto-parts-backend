const GiftCode = require('../models/GiftCode');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

exports.redeem = async (req, res) => {
  try {
    const { code } = req.body;
    const gift = await GiftCode.findOne({ code, isActive: true });
    if (!gift) return res.status(400).json({ msg: 'Invalid or expired code' });

    // Determine the reward amount
    let rewardAmount = 0;
    if (gift.minAmount !== undefined && gift.maxAmount !== undefined && gift.minAmount <= gift.maxAmount) {
      // Random between min and max (inclusive)
      rewardAmount = Math.floor(Math.random() * (gift.maxAmount - gift.minAmount + 1)) + gift.minAmount;
    } else if (gift.amount && gift.amount > 0) {
      // Fallback to fixed amount (for old codes)
      rewardAmount = gift.amount;
    } else {
      return res.status(400).json({ msg: 'Gift code has no valid reward configuration.' });
    }

    const user = await User.findById(req.user.id);
    user.balance += rewardAmount;
    user.cumulativeIncome += rewardAmount;
    await user.save();

    gift.isActive = false;
    gift.usedBy = req.user.id;
    gift.usedAt = new Date();
    await gift.save();

    await new Transaction({
      userId: req.user.id,
      type: 'gift',
      amount: rewardAmount,
      description: `Gift code redemption (${code})`
    }).save();

    res.json({ msg: 'Gift redeemed', balance: user.balance, amount: rewardAmount });
  } catch (err) {
    console.error('Gift redeem error:', err);
    res.status(500).json({ msg: err.message });
  }
};