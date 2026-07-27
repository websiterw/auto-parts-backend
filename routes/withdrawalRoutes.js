const express = require('express');
const router = express.Router();
const withdrawalController = require('../controllers/withdrawalController');
const auth = require('../middleware/auth');

// Submit a withdrawal request (pending approval)
router.post('/request', auth, withdrawalController.requestWithdrawal);

// Get all withdrawal records for the logged-in user
router.get('/', auth, withdrawalController.getUserWithdrawals);

module.exports = router;