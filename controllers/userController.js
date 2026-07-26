const User = require('../models/User');

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { accountNumber } = req.body;
    const user = await User.findById(req.user.id);
    if (accountNumber) user.accountNumber = accountNumber;
    await user.save();
    res.json({ msg: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};