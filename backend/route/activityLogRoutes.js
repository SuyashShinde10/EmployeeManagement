const express = require('express');
const router = express.Router();
const activityLogController = require('../controller/activityLogController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, activityLogController.getActivityLogs);

module.exports = router;
