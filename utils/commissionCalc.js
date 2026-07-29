const User = require('../models/User');
const Commission = require('../models/Commission');
const Transaction = require('../models/Transaction');
const Investment = require('../models/Investment');

const COMMISSION_LEVELS = {
  1: 0.35, // 35%
  2: 0.02, // 2%
  3: 0.01  // 1%
};

exports.calculateCommissions = async (userId, investAmount, investmentId) => {
  try {
    const currentUser = await User.findById(userId);
    if (!currentUser || !currentUser.referredBy) return;

    // === ONLY PAY COMMISSION ON FIRST INVESTMENT ===
    // Count how many active investments this user has
    const investmentCount = await Investment.countDocuments({
      userId: userId,
      isActive: true
    });

    // If this is NOT the first investment (count > 1), skip commission
    if (investmentCount > 1) {
      console.log(`[commissionCalc] User ${currentUser.accountNumber} already has ${investmentCount} investments – skipping commission.`);
      return;
    }

    // ===== FIRST INVESTMENT – pay commission =====
    let level = 1;
    let referrerId = currentUser.referredBy;
    let chainUser = currentUser;

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

      chainUser = referrer;
      referrerId = chainUser.referredBy;
      level++;
    }
  } catch (err) {
    console.error('Commission calculation error:', err);
  }
};
