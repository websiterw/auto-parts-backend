const User = require('../models/User');
const Commission = require('../models/Commission');
const Transaction = require('../models/Transaction');

// Levels and percentages
const COMMISSION_LEVELS = {
  1: 0.39, // 39%
  2: 0.02, // 2%
  3: 0.01  // 1%
};

exports.calculateCommissions = async (userId, investAmount, investmentId) => {
  try {
    // Find the user and their referrer chain (up to 3 levels)
    let currentUser = await User.findById(userId);
    let level = 1;
    let referrerId = currentUser.referredBy;

    while (referrerId && level <= 3) {
      const referrer = await User.findById(referrerId);
      if (!referrer) break;

      const percentage = COMMISSION_LEVELS[level];
      const commissionAmount = investAmount * percentage;

      if (commissionAmount > 0) {
        // Add to referrer's balance
        referrer.balance += commissionAmount;
        referrer.cumulativeIncome += commissionAmount;
        await referrer.save();

        // Record commission
        const commission = new Commission({
          referrerId: referrer._id,
          referredUserId: userId,
          level,
          percentage: percentage * 100,
          amount: commissionAmount,
          investmentId
        });
        await commission.save();

        // Transaction record
        const tx = new Transaction({
          userId: referrer._id,
          type: 'commission',
          amount: commissionAmount,
          description: `Level ${level} commission from user ${currentUser.accountNumber}`,
          reference: commission._id
        });
        await tx.save();
      }

      // Move up the chain
      currentUser = referrer;
      referrerId = currentUser.referredBy;
      level++;
    }
  } catch (err) {
    console.error('Commission calculation error:', err);
  }
};