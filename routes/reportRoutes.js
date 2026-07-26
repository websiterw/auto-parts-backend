const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const adminAuth = require('../middleware/adminAuth');

router.get('/daily', adminAuth, reportController.daily);
router.get('/weekly', adminAuth, reportController.weekly);
router.get('/monthly', adminAuth, reportController.monthly);

module.exports = router;