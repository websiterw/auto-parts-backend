const GiftCode = require('../models/GiftCode');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const GiftRedemption = require('../models/GiftRedemption');

exports.redeem = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    // 1. Find the gift code (must be active)
    const gift = await GiftCode.findOne({ code, isActive: true });
    if (!gift) {
      return res.status(400).json({ msg: 'Invalid or expired code' });
    }

    // 2. Check if this user already redeemed this code
    const existingRedemption = await GiftRedemption.findOne({ giftCodeId: gift._id, userId });
    if (existingRedemption) {
      return res.status(400).json({ msg: 'You have already redeemed this gift code.' });
    }

    // 3. Determine reward amount
    let rewardAmount = 0;
    if (gift.minAmount !== undefined && gift.maxAmount !== undefined && gift.minAmount <= gift.maxAmount) {
      // Random between min and max (inclusive)
      rewardAmount = Math.floor(Math.random() * (gift.maxAmount - gift.minAmount + 1)) + gift.minAmount;
    } else if (gift.amount > 0) {
      rewardAmount = gift.amount; // fallback for old codes
    } else {
      return res.status(400).json({ msg: 'Gift code has no valid reward configuration.' });
    }

    // 4. Credit the user
    const user = await User.findById(userId);
    user.balance += rewardAmount;
    user.cumulativeIncome += rewardAmount;
    await user.save();

    // 5. Record the redemption
    await new GiftRedemption({
      giftCodeId: gift._id,
      userId,
      amount: rewardAmount
    }).save();

    // 6. Record transaction
    await new Transaction({
      userId,
      type: 'gift',
      amount: rewardAmount,
      description: `Gift code redemption (${code})`
    }).save();

    // 7. (Optional) If you want to mark the code as used after a certain number of redemptions, you could check a limit.
    // For now, we keep it active forever.

    res.json({ msg: 'Gift redeemed', balance: user.balance, amount: rewardAmount });
  } catch (err) {
    console.error('Gift redeem error:', err);
    res.status(500).json({ msg: err.message });
  }
};
