const Checkin = require('../models/Checkin');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

exports.checkin = async (req, res) => {
  try {
    const userId = req.user.id;
    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existing = await Checkin.findOne({ userId, date: { $gte: today } });
    if (existing) return res.status(400).json({ msg: 'Already checked in today' });

    const checkin = new Checkin({ userId, reward: 100 });
    await checkin.save();

    const user = await User.findById(userId);
    user.balance += 100;
    user.cumulativeIncome += 100;
    user.checkinDays += 1;
    await user.save();

    await new Transaction({
      userId,
      type: 'checkin',
      amount: 100,
      description: 'Daily check-in reward'
    }).save();

    res.json({ msg: 'Check-in successful', balance: user.balance, checkinDays: user.checkinDays });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};