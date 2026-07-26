const Investment = require('../models/Investment');
const Product = require('../models/Product');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { calculateCommissions } = require('../utils/commissionCalc');

exports.purchase = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ msg: 'Product not found' });

    const user = await User.findById(userId);

    // If user has bonus balance (registration bonus), move it to main balance
    if (user.bonusBalance > 0) {
      user.balance += user.bonusBalance;
      user.bonusBalance = 0;
      await user.save();
    }

    if (user.balance < product.price) {
      return res.status(400).json({ msg: 'Insufficient balance' });
    }

    // Deduct balance
    user.balance -= product.price;
    await user.save();

    const investment = new Investment({
      userId,
      productId,
      productName: product.name,
      price: product.price,
      dailyIncome: product.dailyIncome,
      totalIncome: product.totalIncome,
      termDays: product.termDays,
      daysRemaining: product.termDays
    });
    await investment.save();

    await new Transaction({
      userId,
      type: 'deposit',
      amount: -product.price,
      description: `Purchased ${product.name}`,
      reference: investment._id
    }).save();

    // Calculate commissions
    await calculateCommissions(userId, product.price, investment._id);

    res.json({ msg: 'Purchase successful', investment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
};

exports.getUserInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.user.id, isActive: true });
    res.json(investments);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.processDailyIncome = async () => {
  console.log('Processing daily income...');
  const investments = await Investment.find({ isActive: true, daysRemaining: { $gt: 0 } });
  for (const inv of investments) {
    const user = await User.findById(inv.userId);
    if (!user) continue;
    user.balance += inv.dailyIncome;
    user.cumulativeIncome += inv.dailyIncome;
    await user.save();
    await new Transaction({
      userId: inv.userId,
      type: 'product_income',
      amount: inv.dailyIncome,
      description: `Daily income from ${inv.productName}`
    }).save();
    inv.daysRemaining -= 1;
    if (inv.daysRemaining === 0) inv.isActive = false;
    await inv.save();
  }
};