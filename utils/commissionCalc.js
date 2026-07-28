const User = require('../models/User');
const Commission = require('../models/Commission');
const Transaction = require('../models/Transaction');

const COMMISSION_LEVELS = {
  1: 0.35,
  2: 0.02,
  3: 0.01
};

exports.calculateCommissions = async (userId, investAmount, investmentId) => {
  try {
    const currentUser = await User.findById(userId);
    if (!currentUser || !currentUser.referredBy) return;

    // Check if this referred user already has any commission
    const existingCommission = await Commission.findOne({ referredUserId: userId });
    if (existingCommission) {
      // Already paid commission for this user's first deposit, skip
      return;
    }

    let level = 1;
    let referrerId = currentUser.referredBy;
    let referrer = await User.findById(referrerId);

    while (referrer && level <= 3) {
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

      // Move up the chain: the referrer becomes the next user to check their referrer
      const nextReferrerId = referrer.referredBy;
      referrer = nextReferrerId ? await User.findById(nextReferrerId) : null;
      level++;
    }
  } catch (err) {
    console.error('Commission calculation error:', err);
  }
};
