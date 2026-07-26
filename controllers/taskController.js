const Task = require('../models/Task');
const User = require('../models/User');

exports.getTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await Task.find({ isActive: true });
    // Count level1 referrals
    const level1Count = await User.countDocuments({ referredBy: userId });
    // Build response with progress
    const result = tasks.map(t => {
      let current = 0;
      if (t.level === 1) current = level1Count;
      // For levels 2 and 3, we'd need more complex queries; for simplicity we use 0
      // but you can implement real counting if you store user tree.
      return {
        ...t.toObject(),
        current
      };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};