const Task = require('../models/Task');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// GET tasks with current progress
exports.getTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate('claimedTasks');

    // Count Level 1 referrals
    const level1Count = await User.countDocuments({ referredBy: userId });

    const tasks = await Task.find({ isActive: true });

    const result = tasks.map(t => {
      let current = 0;
      if (t.level === 1) {
        current = level1Count;
      }
      // For levels 2 and 3 we can add logic later; keep 0 for now.
      const isClaimed = user.claimedTasks.some(ct => ct._id.toString() === t._id.toString());
      return {
        ...t.toObject(),
        current,
        claimed: isClaimed
      };
    });

    res.json(result);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ msg: err.message });
  }
};

// POST /claim/:taskId
exports.claimTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ msg: 'Task not found' });

    const user = await User.findById(userId);
    // Check if already claimed
    if (user.claimedTasks.includes(taskId)) {
      return res.status(400).json({ msg: 'Task already claimed' });
    }

    // Count Level 1 referrals for this user
    const level1Count = await User.countDocuments({ referredBy: userId });
    // Determine if task is completed (only level 1 tasks for now)
    let completed = false;
    if (task.level === 1 && level1Count >= task.target) {
      completed = true;
    }

    if (!completed) {
      return res.status(400).json({ msg: 'Task not yet completed' });
    }

    // Add reward to user
    user.balance += task.reward;
    user.cumulativeIncome += task.reward;
    user.claimedTasks.push(taskId);
    await user.save();

    // Record transaction
    await new Transaction({
      userId: user._id,
      type: 'task_reward',
      amount: task.reward,
      description: `Task reward: ${task.name}`,
      status: 'success'
    }).save();

    res.json({ msg: 'Reward claimed successfully!', newBalance: user.balance });
  } catch (err) {
    console.error('Error claiming task:', err);
    res.status(500).json({ msg: err.message });
  }
};