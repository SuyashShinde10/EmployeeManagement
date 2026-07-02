const express = require('express');
const router = express.Router();
const notificationController = require('../controller/notificationController');
const { requireAuth: protect } = require('../middleware/requireAuth');

router.get('/', protect, notificationController.getNotifications);
router.put('/:id/read', protect, notificationController.markAsRead);
router.put('/read-all', protect, notificationController.markAllAsRead);

module.exports = router;
