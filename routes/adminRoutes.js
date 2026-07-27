const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');

// Public
router.post('/login', adminController.login);

// Protected (admin only)
router.get('/dashboard', adminAuth, adminController.dashboard);

// Users
router.get('/users', adminAuth, adminController.getUsers);
router.put('/users/:id', adminAuth, adminController.updateUser);
router.delete('/users/:id', adminAuth, adminController.deleteUser);

// Transactions
router.get('/transactions', adminAuth, adminController.getTransactions);
router.put('/transactions/:id', adminAuth, adminController.updateTransaction);

// Withdrawals (pending)
router.get('/withdrawals/pending', adminAuth, adminController.getPendingWithdrawals);
router.post('/withdrawals/:id/approve', adminAuth, adminController.approveWithdrawal);
router.post('/withdrawals/:id/reject', adminAuth, adminController.rejectWithdrawal);

// Recharges (pending)
router.get('/recharges/pending', adminAuth, adminController.getPendingRecharges);
router.post('/recharges/:id/approve', adminAuth, adminController.approveRecharge);
router.post('/recharges/:id/reject', adminAuth, adminController.rejectRecharge);

// Products
router.post('/products', adminAuth, adminController.createProduct);
router.delete('/products/:id', adminAuth, adminController.deleteProduct);

// ============================================================
// Gift Codes – ORDER MATTERS: "/all" must come BEFORE "/:id"
// ============================================================
router.get('/giftcodes', adminAuth, adminController.getGiftCodes);
router.post('/giftcodes', adminAuth, adminController.createGiftCode);
router.delete('/giftcodes/all', adminAuth, adminController.deleteAllGiftCodes);
router.delete('/giftcodes/:id', adminAuth, adminController.deleteGiftCode);

// Settings
router.get('/settings', adminAuth, adminController.getSettings);
router.put('/settings', adminAuth, adminController.updateSettings);

// Admin password change
router.post('/change-password', adminAuth, adminController.changePassword);

module.exports = router;