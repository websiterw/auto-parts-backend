const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');

// GET all tasks with progress
router.get('/', auth, taskController.getTasks);

// POST claim a task reward
router.post('/claim/:taskId', auth, taskController.claimTask);  // ✅ NEW

module.exports = router;
