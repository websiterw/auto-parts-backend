const express = require('express');
const router = express.Router();
const checkinController = require('../controllers/checkinController');
const auth = require('../middleware/auth');

router.post('/', auth, checkinController.checkin);

module.exports = router;