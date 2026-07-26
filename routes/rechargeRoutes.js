const express = require('express');
const router = express.Router();
const rechargeController = require('../controllers/rechargeController');
const auth = require('../middleware/auth');

router.post('/request', auth, rechargeController.requestRecharge);
router.get('/', auth, rechargeController.getUserRecharges);

module.exports = router;