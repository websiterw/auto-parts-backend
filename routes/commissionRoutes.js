const express = require('express');
const router = express.Router();
const commissionController = require('../controllers/commissionController');
const auth = require('../middleware/auth');

router.get('/', auth, commissionController.getUserCommissions);

module.exports = router;