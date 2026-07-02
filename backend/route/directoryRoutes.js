const express = require('express');
const router = express.Router();
const directoryController = require('../controller/directoryController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, directoryController.getDirectory);

module.exports = router;
