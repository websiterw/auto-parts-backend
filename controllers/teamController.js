const User = require('../models/User');
const Commission = require('../models/Commission');
const Investment = require('../models/Investment');

exports.getTeamData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Helper: fetch users with their total active investment
    const getUsersWithInvestments = async (users) => {
      const result = [];
      for (const user of users) {
        const investments = await Investment.find({ userId: user._id, isActive: true });
        const totalInvested = investments.reduce((sum, inv) => sum + inv.price, 0);
        result.push({
          ...user.toObject(),
          totalInvested
        });
      }
      return result;
    };

    // Level 1 (direct referrals)
    const level1Users = await User.find({ referredBy: userId }).select('accountNumber balance createdAt');
    const level1WithInvest = await getUsersWithInvestments(level1Users);
    const level1Ids = level1Users.map(u => u._id);

    // Level 2
    const level2Users = await User.find({ referredBy: { $in: level1Ids } }).select('accountNumber');
    const level2WithInvest = await getUsersWithInvestments(level2Users);
    const level2Ids = level2Users.map(u => u._id);

    // Level 3
    const level3Users = await User.find({ referredBy: { $in: level2Ids } }).select('accountNumber');
    const level3WithInvest = await getUsersWithInvestments(level3Users);

    // Total rewards (commissions earned by this user)
    const commissions = await Commission.find({ referrerId: userId });
    const totalRewards = commissions.reduce((sum, c) => sum + c.amount, 0);

    // Total recharge = sum of all investments from all team members
    const allTeamMembers = [...level1WithInvest, ...level2WithInvest, ...level3WithInvest];
    const totalRecharge = allTeamMembers.reduce((sum, member) => sum + (member.totalInvested || 0), 0);

    res.json({
      level1: level1WithInvest,
      level2: level2WithInvest,
      level3: level3WithInvest,
      totalUsers: level1WithInvest.length + level2WithInvest.length + level3WithInvest.length,
      totalRewards,
      totalRecharge
    });
  } catch (err) {
    console.error('Team data error:', err);
    res.status(500).json({ msg: err.message });
  }
};
