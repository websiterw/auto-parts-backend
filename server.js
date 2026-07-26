require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { createDefaultAdmin } = require('./controllers/adminController');
const investmentController = require('./controllers/investmentController');

const app = express();

// Connect to MongoDB
connectDB();

// Create default admin (username: admin, password: admin123)
createDefaultAdmin();

// Middleware
app.use(cors());
app.use(express.json());

// ------------------- ROUTES ------------------- //
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/investments', require('./routes/investmentRoutes'));
app.use('/api/team', require('./routes/teamRoutes'));
app.use('/api/withdrawals', require('./routes/withdrawalRoutes'));
app.use('/api/checkin', require('./routes/checkinRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/gift', require('./routes/giftRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/managers', require('./routes/adminRoutes'));   // Admin panel
app.use('/api/reports', require('./routes/reportRoutes'));    // Reports
app.use('/api/recharges', require('./routes/rechargeRoutes')); // Recharge requests

// ------------------- CRON JOB: Daily Income ------------------- //
cron.schedule('0 0 * * *', async () => {
  console.log('[CRON] Running daily income job...');
  try {
    await investmentController.processDailyIncome();
    console.log('[CRON] Daily income processed successfully.');
  } catch (err) {
    console.error('[CRON] Error processing daily income:', err);
  }
});

// Temporary test endpoint (manual trigger)
app.get('/api/force-income', async (req, res) => {
  try {
    await investmentController.processDailyIncome();
    res.json({ msg: 'Income processed manually.' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ------------------- ERROR HANDLING ------------------- //
app.use(errorHandler);

// ------------------- START SERVER ------------------- //
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('🔑 Default admin: admin / admin123');
});