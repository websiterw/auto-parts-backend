const User = require('../models/User');
const Commission = require('../models/Commission');
const Transaction = require('../models/Transaction');

// Commission levels: L1 = 35%, L2 = 2%, L3 = 1%
const COMMISSION_LEVELS = {
  1: 0.35,
  2: 0.02,
  3: 0.01
};

exports.calculateCommissions = async (userId, investAmount, investmentId) => {
  try {
    let currentUser = await User.findById(userId);
    let level = 1;
    let referrerId = currentUser.referredBy;

    while (referrerId && level <= 3) {
      const referrer = await User.findById(referrerId);
      if (!referrer) break;

      const percentage = COMMISSION_LEVELS[level];
      const commissionAmount = investAmount * percentage;

      if (commissionAmount > 0) {
        referrer.balance += commissionAmount;
        referrer.cumulativeIncome += commissionAmount;
        await referrer.save();

        const commission = new Commission({
          referrerId: referrer._id,
          referredUserId: userId,
          level,
          percentage: percentage * 100,
          amount: commissionAmount,
          investmentId
        });
        await commission.save();

        await new Transaction({
          userId: referrer._id,
          type: 'commission',
          amount: commissionAmount,
          description: `Level ${level} commission from user ${currentUser.accountNumber}`,
          reference: commission._id
        }).save();
      }

      currentUser = referrer;
      referrerId = currentUser.referredBy;
      level++;
    }
  } catch (err) {
    console.error('Commission calculation error:', err);
  }
};