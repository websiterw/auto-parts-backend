const PendingWithdrawal = require('../models/PendingWithdrawal');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Investment = require('../models/Investment'); // <-- NEW: required to check active product

// ============================================
// SUBMIT WITHDRAWAL REQUEST (PENDING)
// ============================================
exports.requestWithdrawal = async (req, res) => {
  try {
    const { amount, fee, netAmount, bankDetails } = req.body;
    const userId = req.user.id;

    // 1. Validate amount
    if (!amount || amount < 3000) {
      return res.status(400).json({ msg: 'Minimum withdrawal amount is RWF 3,000' });
    }

    // 2. Check user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // 3. Check sufficient balance
    if (user.balance < amount) {
      return res.status(400).json({ msg: 'Insufficient balance' });
    }

    // 4. NEW: Check if the user has an ACTIVE investment (product)
    const activeInvestment = await Investment.findOne({ userId, isActive: true });
    if (!activeInvestment) {
      return res.status(400).json({ msg: 'You must have an active product to withdraw.' });
    }

    // 5. Deduct balance immediately (refunded if rejected)
    user.balance -= amount;
    await user.save();

    // 6. Create pending withdrawal record
    const pending = new PendingWithdrawal({
      userId,
      amount,
      fee: fee || amount * 0.2,
      netAmount: netAmount || amount - (amount * 0.2),
      bankDetails,
      status: 'pending'
    });
    await pending.save();

    // 7. Record the transaction
    await new Transaction({
      userId,
      type: 'withdrawal',
      amount: -amount,
      description: `Withdrawal request pending #${pending._id}`,
      reference: pending._id,
      status: 'pending'
    }).save();

    res.json({
      msg: 'Withdrawal request submitted for approval.',
      pendingId: pending._id,
      status: 'pending'
    });
  } catch (err) {
    console.error('Withdrawal request error:', err);
    res.status(500).json({ msg: err.message });
  }
};

// ============================================
// GET WITHDRAWAL RECORDS FOR THE USER
// ============================================
exports.getUserWithdrawals = async (req, res) => {
  try {
    const userId = req.user.id;
    const withdrawals = await PendingWithdrawal.find({ userId }).sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (err) {
    console.error('Get withdrawals error:', err);
    res.status(500).json({ msg: err.message });
  }
};
