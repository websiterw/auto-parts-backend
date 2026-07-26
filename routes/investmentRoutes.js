const express = require('express');
const router = express.Router();
const investmentController = require('../controllers/investmentController');
const auth = require('../middleware/auth');

router.post('/purchase', auth, investmentController.purchase);
router.get('/', auth, investmentController.getUserInvestments);

module.exports = router;