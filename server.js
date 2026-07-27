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
app.use(cors()); // Allow all origins (for testing – you can restrict later)
app.use(express.json()); // Parse JSON bodies

// ===========================
// 4. Routes – all API endpoints
// ===========================
app.use('/api/auth', require('./routes/authRoutes'));                 // Register / Login / GetMe
app.use('/api/products', require('./routes/productRoutes'));           // Product listing & management
app.use('/api/investments', require('./routes/investmentRoutes'));     // Purchase & investment history
app.use('/api/team', require('./routes/teamRoutes'));                 // Team data & referral stats
app.use('/api/withdrawals', require('./routes/withdrawalRoutes'));     // Withdrawal requests & history
app.use('/api/checkin', require('./routes/checkinRoutes'));           // Daily check‑in
app.use('/api/tasks', require('./routes/taskRoutes'));                // Task center
app.use('/api/gift', require('./routes/giftRoutes'));                 // Gift code redemption
app.use('/api/transactions', require('./routes/transactionRoutes'));   // Transaction history
app.use('/api/managers', require('./routes/adminRoutes'));            // Admin panel (login, users, etc.)
app.use('/api/reports', require('./routes/reportRoutes'));            // Reports (daily/weekly/monthly)
app.use('/api/recharges', require('./routes/rechargeRoutes'));         // Recharge requests
app.use('/api/settings', require('./routes/settingsRoutes'));         // Public settings (bank details)

// ===========================
// 5. Root route – health check
// ===========================
app.get('/', (req, res) => {
  res.json({ msg: '🚀 Auto Parts Backend is running!' });
});

// ===========================
// 6. Cron job: daily income (midnight UTC)
// ===========================
cron.schedule('0 0 * * *', async () => {
  console.log('[CRON] Running daily income job...');
  try {
    await investmentController.processDailyIncome();
    console.log('[CRON] Daily income processed successfully.');
  } catch (err) {
    console.error('[CRON] Error processing daily income:', err);
  }
});

// ===========================
// 7. Manual income trigger (for testing)
// ===========================
app.get('/api/force-income', async (req, res) => {
  try {
    await investmentController.processDailyIncome();
    res.json({ msg: 'Income processed manually.' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ===========================
// 8. Global error handler
// ===========================
app.use(errorHandler);

// ===========================
// 9. Start server
// ===========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('🔑 Default admin: admin / admin123');
});