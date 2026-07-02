const express = require('express');
const router = express.Router();
const { requireAuth, requirePM } = require('../middleware/requireAuth');
const { getPMAnalytics, getEmployeeAnalytics } = require('../controller/analyticsController');

// All analytics routes require a valid JWT
router.use(requireAuth);

// Routes
router.get('/pm', requirePM, getPMAnalytics);
router.get('/employee', getEmployeeAnalytics);

module.exports = router;
