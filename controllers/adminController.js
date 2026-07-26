const Admin = require('../models/Admin');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const PendingWithdrawal = require('../models/PendingWithdrawal');
const PendingRecharge = require('../models/PendingRecharge');
const Product = require('../models/Product');
const GiftCode = require('../models/GiftCode');
const Settings = require('../models/Settings');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ========== AUTH ==========
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign(
      { admin: { id: admin.id, role: admin.role } },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({ token, admin: { username: admin.username, role: admin.role } });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ========== DASHBOARD ==========
exports.dashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalInvestments = await require('../models/Investment').countDocuments();
    const pendingWithdrawals = await PendingWithdrawal.countDocuments({ status: 'pending' });
    const pendingRecharges = await PendingRecharge.countDocuments({ status: 'pending' });
    const totalCommission = await Transaction.aggregate([
      { $match: { type: 'commission' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    res.json({
      totalUsers,
      totalInvestments,
      pendingWithdrawals,
      pendingRecharges,
      totalCommission: totalCommission[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ========== USERS ==========
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('referredBy', 'accountNumber');
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { balance, level, checkinDays, password } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (balance !== undefined) user.balance = balance;
    if (level !== undefined) user.level = level;
    if (checkinDays !== undefined) user.checkinDays = checkinDays;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    await user.save();
    res.json({ msg: 'User updated' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ msg: 'User deleted' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ========== TRANSACTIONS ==========
exports.getTransactions = async (req, res) => {
  try {
    const { type, status } = req.query;
    const filter = {};
    if (type && type !== 'all') filter.type = type;
    if (status && status !== 'all') filter.status = status;
    const txs = await Transaction.find(filter)
      .populate('userId', 'accountNumber')
      .sort({ createdAt: -1 })
      .limit(500);
    res.json(txs);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const tx = await Transaction.findById(id);
    if (!tx) return res.status(404).json({ msg: 'Transaction not found' });
    tx.status = status;
    await tx.save();
    res.json({ msg: 'Transaction updated' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ========== PENDING WITHDRAWALS ==========
exports.getPendingWithdrawals = async (req, res) => {
  try {
    const pending = await PendingWithdrawal.find({ status: 'pending' }).populate('userId', 'accountNumber balance');
    res.json(pending);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.approveWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const withdrawal = await PendingWithdrawal.findById(id);
    if (!withdrawal) return res.status(404).json({ msg: 'Not found' });

    withdrawal.status = 'approved';
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    await new Transaction({
      userId: withdrawal.userId,
      type: 'withdrawal',
      amount: -withdrawal.amount,
      description: `Withdrawal approved #${withdrawal._id}`,
      reference: withdrawal._id,
      status: 'success'
    }).save();

    res.json({ msg: 'Withdrawal approved' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.rejectWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const withdrawal = await PendingWithdrawal.findById(id);
    if (!withdrawal) return res.status(404).json({ msg: 'Not found' });

    withdrawal.status = 'rejected';
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    // Refund user
    const user = await User.findById(withdrawal.userId);
    if (user) {
      user.balance += withdrawal.amount;
      await user.save();
    }

    await new Transaction({
      userId: withdrawal.userId,
      type: 'adjustment',
      amount: withdrawal.amount,
      description: `Withdrawal rejected, refund #${withdrawal._id}`,
      reference: withdrawal._id,
      status: 'failed'
    }).save();

    res.json({ msg: 'Withdrawal rejected and refunded' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ========== PENDING RECHARGES ==========
exports.getPendingRecharges = async (req, res) => {
  try {
    const pending = await PendingRecharge.find({ status: 'pending' }).populate('userId', 'accountNumber');
    res.json(pending);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.approveRecharge = async (req, res) => {
  try {
    const { id } = req.params;
    const recharge = await PendingRecharge.findById(id);
    if (!recharge) return res.status(404).json({ msg: 'Not found' });

    recharge.status = 'approved';
    recharge.processedAt = new Date();
    await recharge.save();

    const user = await User.findById(recharge.userId);
    if (user) {
      user.balance += recharge.amount;
      user.cumulativeIncome += recharge.amount;
      await user.save();
    }

    await new Transaction({
      userId: recharge.userId,
      type: 'deposit',
      amount: recharge.amount,
      description: `Recharge approved #${recharge._id}`,
      reference: recharge._id,
      status: 'success'
    }).save();

    res.json({ msg: 'Recharge approved' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.rejectRecharge = async (req, res) => {
  try {
    const { id } = req.params;
    const recharge = await PendingRecharge.findById(id);
    if (!recharge) return res.status(404).json({ msg: 'Not found' });

    recharge.status = 'rejected';
    recharge.processedAt = new Date();
    await recharge.save();

    res.json({ msg: 'Recharge rejected' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ========== PRODUCTS ==========
exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.json({ msg: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ========== GIFT CODES ==========
exports.getGiftCodes = async (req, res) => {
  try {
    const gifts = await GiftCode.find().sort({ createdAt: -1 });
    res.json(gifts);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.createGiftCode = async (req, res) => {
  try {
    const { code, amount } = req.body;
    const existing = await GiftCode.findOne({ code });
    if (existing) return res.status(400).json({ msg: 'Code already exists' });
    const gift = new GiftCode({ code, amount });
    await gift.save();
    res.json(gift);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.deleteGiftCode = async (req, res) => {
  try {
    const { id } = req.params;
    await GiftCode.findByIdAndDelete(id);
    res.json({ msg: 'Gift code deleted' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ========== SETTINGS ==========
exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    const {
      telegramLink,
      telegramGroup,
      telegramChannel,
      minWithdrawal,
      withdrawalFee,
      mtnAccount,
      mtnName,
      airtelAccount,
      airtelName
    } = req.body;

    if (telegramLink !== undefined) settings.telegramLink = telegramLink;
    if (telegramGroup !== undefined) settings.telegramGroup = telegramGroup;
    if (telegramChannel !== undefined) settings.telegramChannel = telegramChannel;
    if (minWithdrawal !== undefined) settings.minWithdrawal = minWithdrawal;
    if (withdrawalFee !== undefined) settings.withdrawalFee = withdrawalFee;
    if (mtnAccount !== undefined) settings.mtnAccount = mtnAccount;
    if (mtnName !== undefined) settings.mtnName = mtnName;
    if (airtelAccount !== undefined) settings.airtelAccount = airtelAccount;
    if (airtelName !== undefined) settings.airtelName = airtelName;

    settings.updatedAt = new Date();
    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ========== CREATE DEFAULT ADMIN ==========
exports.createDefaultAdmin = async () => {
  try {
    const existing = await Admin.findOne({ username: 'admin' });
    if (!existing) {
      const hashed = await bcrypt.hash('admin123', 10);
      const admin = new Admin({ username: 'admin', password: hashed, role: 'owner' });
      await admin.save();
      console.log('✅ Default admin created: admin / admin123');
    } else {
      console.log('ℹ️ Default admin already exists.');
    }
  } catch (err) {
    console.error('Error creating admin:', err);
  }
};