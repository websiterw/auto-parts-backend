const User = require('../models/User');
const Commission = require('../models/Commission');
const Investment = require('../models/Investment');

exports.getTeamData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Level 1
    const level1Users = await User.find({ referredBy: userId }).select('accountNumber balance createdAt');
    const level1Ids = level1Users.map(u => u._id);

    // Level 2
    const level2Users = await User.find({ referredBy: { $in: level1Ids } }).select('accountNumber');
    const level2Ids = level2Users.map(u => u._id);

    // Level 3
    const level3Users = await User.find({ referredBy: { $in: level2Ids } }).select('accountNumber');

    // Total rewards = sum of all commissions earned by this user
    const commissions = await Commission.find({ referrerId: userId });
    const totalRewards = commissions.reduce((sum, c) => sum + c.amount, 0);

    res.json({
      level1: level1Users,
      level2: level2Users,
      level3: level3Users,
      totalUsers: level1Users.length + level2Users.length + level3Users.length,
      totalRewards
    });
  } catch (err) {
    console.error('Team data error:', err);
    res.status(500).json({ msg: err.message });
  }
};
