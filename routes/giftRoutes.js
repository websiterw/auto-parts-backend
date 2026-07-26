const express = require('express');
const router = express.Router();
const giftController = require('../controllers/giftController');
const auth = require('../middleware/auth');

router.post('/redeem', auth, giftController.redeem);

module.exports = router;