const express = require('express');
const router = express.Router();
const withdrawalController = require('../controllers/withdrawalController');
const auth = require('../middleware/auth');

// Protected routes (user must be logged in)
router.post('/request', auth, withdrawalController.requestWithdrawal);
router.get('/', auth, withdrawalController.getUserWithdrawals);

module.exports = router;