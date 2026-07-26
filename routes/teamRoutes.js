const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const auth = require('../middleware/auth');

router.get('/', auth, teamController.getTeamData);

module.exports = router;