const User = require('../models/User');
const Commission = require('../models/Commission');
const Investment = require('../models/Investment'); // <-- ADD THIS

exports.getTeamData = async (req, res) => {
  try {
    const userId = req.user.id;

    // --- Level 1 (direct referrals) ---
    const level1Users = await User.find({ referredBy: userId }).select('accountNumber balance createdAt');
    const level1Ids = level1Users.map(u => u._id);

    // Add total investment amount for each level1 user
    const level1WithAmount = await Promise.all(level1Users.map(async (u) => {
      const investments = await Investment.find({ userId: u._id, isActive: true });
      const totalInvested = investments.reduce((sum, inv) => sum + inv.price, 0);
      return {
        ...u.toObject(),
        amount: totalInvested
      };
    }));

    // --- Level 2 ---
    const level2Users = await User.find({ referredBy: { $in: level1Ids } }).select('accountNumber');
    const level2Ids = level2Users.map(u => u._id);

    const level2WithAmount = await Promise.all(level2Users.map(async (u) => {
      const investments = await Investment.find({ userId: u._id, isActive: true });
      const totalInvested = investments.reduce((sum, inv) => sum + inv.price, 0);
      return {
        ...u.toObject(),
        amount: totalInvested
      };
    }));

    // --- Level 3 ---
    const level3Users = await User.find({ referredBy: { $in: level2Ids } }).select('accountNumber');
    const level3Ids = level3Users.map(u => u._id);

    const level3WithAmount = await Promise.all(level3Users.map(async (u) => {
      const investments = await Investment.find({ userId: u._id, isActive: true });
      const totalInvested = investments.reduce((sum, inv) => sum + inv.price, 0);
      return {
        ...u.toObject(),
        amount: totalInvested
      };
    }));

    // Total rewards (sum of all commissions earned)
    const commissions = await Commission.find({ referrerId: userId });
    const totalRewards = commissions.reduce((sum, c) => sum + c.amount, 0);

    res.json({
      level1: level1WithAmount,
      level2: level2WithAmount,
      level3: level3WithAmount,
      totalUsers: level1Users.length + level2Users.length + level3Users.length,
      totalRewards
    });
  } catch (err) {
    console.error('Team data error:', err);
    res.status(500).json({ msg: err.message });
  }
};
