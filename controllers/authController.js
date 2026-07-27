const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate a random 5‑character alphanumeric code (e.g., "A7B3C")
function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

exports.register = async (req, res) => {
  try {
    const { accountNumber, password, invitationCode } = req.body;

    if (!accountNumber || !password) {
      return res.status(400).json({ msg: 'Please provide account number and password' });
    }

    let user = await User.findOne({ accountNumber });
    if (user) {
      return res.status(400).json({ msg: 'Account already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate a unique referral code (retry if collision)
    let myReferralCode;
    let exists = true;
    while (exists) {
      myReferralCode = generateReferralCode();
      const existing = await User.findOne({ myReferralCode });
      if (!existing) exists = false;
    }

    const newUser = new User({
      accountNumber,
      password: hashedPassword,
      invitationCode: invitationCode || '',
      myReferralCode,
      balance: 3000, // registration bonus
      cumulativeIncome: 3000,
      level: 1,
      checkinDays: 0,
      referredBy: null
    });

    if (invitationCode) {
      const referrer = await User.findOne({ myReferralCode: invitationCode });
      if (referrer) {
        newUser.referredBy = referrer._id;
      }
    }

    await newUser.save();

    // Record registration bonus transaction
    const Transaction = require('../models/Transaction');
    await new Transaction({
      userId: newUser._id,
      type: 'adjustment',
      amount: 3000,
      description: 'Registration bonus',
      status: 'success'
    }).save();

    const payload = { user: { id: newUser.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: newUser.id,
        accountNumber: newUser.accountNumber,
        balance: newUser.balance,
        cumulativeIncome: newUser.cumulativeIncome,
        myReferralCode: newUser.myReferralCode,
        level: newUser.level,
        checkinDays: newUser.checkinDays
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ msg: 'Server error: ' + err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { accountNumber, password } = req.body;

    if (!accountNumber || !password) {
      return res.status(400).json({ msg: 'Please provide account number and password' });
    }

    const user = await User.findOne({ accountNumber });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        accountNumber: user.accountNumber,
        balance: user.balance,
        cumulativeIncome: user.cumulativeIncome,
        myReferralCode: user.myReferralCode,
        level: user.level,
        checkinDays: user.checkinDays
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error: ' + err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({ msg: 'Server error: ' + err.message });
  }
};