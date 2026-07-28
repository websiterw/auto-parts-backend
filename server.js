require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { createDefaultAdmin } = require('./controllers/adminController');
const investmentController = require('./controllers/investmentController');

const app = express();

// ===========================
// 1. Connect to MongoDB
// ===========================
connectDB();

// ===========================
// 2. Create default admin (admin / admin123)
// ===========================
createDefaultAdmin();

// ===========================
// 3. Middleware
// ===========================
app.use(cors());
app.use(express.json());

// ===========================
// 4. Routes – ALL endpoints
// ===========================
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/investments', require('./routes/investmentRoutes'));
app.use('/api/team', require('./routes/teamRoutes'));
app.use('/api/withdrawals', require('./routes/withdrawalRoutes'));
app.use('/api/checkin', require('./routes/checkinRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/gift', require('./routes/giftRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/managers', require('./routes/adminRoutes'));  // <-- IMPORTANT
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/recharges', require('./routes/rechargeRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));

// ===========================
// 5. Health check
// ===========================
app.get('/', (req, res) => {
  res.json({ msg: 'Auto Parts Backend is running!' });
});

// ===========================
// 6. NEW endpoint: process due incomes (called by external cron)
// ===========================
app.get('/api/process-incomes', async (req, res) => {
  try {
    const count = await investmentController.processDueIncomes();
    res.json({ msg: `Processed ${count} income payments.` });
  } catch (err) {
    console.error('[process-incomes] Error:', err);
    res.status(500).json({ msg: err.message });
  }
});

// ===========================
// 7. Legacy midnight cron (optional, but harmless)
// ===========================
cron.schedule('0 0 * * *', async () => {
  console.log('[CRON] Running daily income job (legacy)...');
  try {
    await investmentController.processDailyIncome();
    console.log('[CRON] Legacy daily income processed.');
  } catch (err) {
    console.error('[CRON] Error:', err);
  }
});

// ===========================
// 8. Manual trigger (for testing)
// ===========================
app.get('/api/force-income', async (req, res) => {
  try {
    await investmentController.processDueIncomes(); // use new function
    res.json({ msg: 'Income processed manually (due incomes).' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ===========================
// 9. Global error handler
// ===========================
app.use(errorHandler);

// ===========================
// 10. Start server
// ===========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('🔑 Default admin: admin / admin123');
});
