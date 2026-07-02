const express = require('express');
const router = express.Router();
const activityLogController = require('../controller/activityLogController');
const { requireAuth: protect } = require('../middleware/requireAuth');

router.get('/', protect, activityLogController.getActivityLogs);

module.exports = router;
