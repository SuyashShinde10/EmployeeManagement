const express = require('express');
const router = express.Router();
const directoryController = require('../controller/directoryController');
const { requireAuth: protect } = require('../middleware/requireAuth');

router.get('/', protect, directoryController.getDirectory);

module.exports = router;
