const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');

// ============================================================
// PUBLIC ROUTES
// ============================================================
router.post('/login', adminController.login);

// ============================================================
// PROTECTED ROUTES (admin only)
// ============================================================

// ----- Dashboard -----
router.get('/dashboard', adminAuth, adminController.dashboard);

// ----- Users -----
router.get('/users', adminAuth, adminController.getUsers);
router.put('/users/:id', adminAuth, adminController.updateUser);
router.delete('/users/:id', adminAuth, adminController.deleteUser);

// ----- Transactions -----
router.get('/transactions', adminAuth, adminController.getTransactions);
router.put('/transactions/:id', adminAuth, adminController.updateTransaction);
// "all" must come before ":id"
router.delete('/transactions/all', adminAuth, adminController.deleteAllTransactions);
router.delete('/transactions/:id', adminAuth, adminController.deleteTransaction);

// ----- Withdrawals (pending) -----
router.get('/withdrawals/pending', adminAuth, adminController.getPendingWithdrawals);
router.post('/withdrawals/:id/approve', adminAuth, adminController.approveWithdrawal);
router.post('/withdrawals/:id/reject', adminAuth, adminController.rejectWithdrawal);
// "all" must come before ":id"
router.delete('/withdrawals/all', adminAuth, adminController.deleteAllWithdrawals);
router.delete('/withdrawals/:id', adminAuth, adminController.deleteWithdrawal);

// ----- Recharges (pending) -----
router.get('/recharges/pending', adminAuth, adminController.getPendingRecharges);
router.post('/recharges/:id/approve', adminAuth, adminController.approveRecharge);
router.post('/recharges/:id/reject', adminAuth, adminController.rejectRecharge);
// "all" must come before ":id"
router.delete('/recharges/all', adminAuth, adminController.deleteAllRecharges);
router.delete('/recharges/:id', adminAuth, adminController.deleteRecharge);

// ----- Products -----
router.post('/products', adminAuth, adminController.createProduct);
router.delete('/products/:id', adminAuth, adminController.deleteProduct);

// ----- Gift Codes -----
router.get('/giftcodes', adminAuth, adminController.getGiftCodes);
router.post('/giftcodes', adminAuth, adminController.createGiftCode);
// "all" must come before ":id"
router.delete('/giftcodes/all', adminAuth, adminController.deleteAllGiftCodes);
router.delete('/giftcodes/:id', adminAuth, adminController.deleteGiftCode);

// ----- Investments -----
router.get('/investments', adminAuth, adminController.getInvestments);
router.put('/investments/:id', adminAuth, adminController.updateInvestment);
router.delete('/investments/:id', adminAuth, adminController.deleteInvestment);

// ----- Settings -----
router.get('/settings', adminAuth, adminController.getSettings);
router.put('/settings', adminAuth, adminController.updateSettings);

// ----- Admin password change -----
router.post('/change-password', adminAuth, adminController.changePassword);

module.exports = router;
