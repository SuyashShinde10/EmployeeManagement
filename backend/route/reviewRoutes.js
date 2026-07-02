const express = require('express');
const router = express.Router();
const reviewController = require('../controller/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, reviewController.createReview);
router.get('/company', protect, reviewController.getCompanyReviews); // PM only
router.get('/me', protect, reviewController.getMyReviews);

module.exports = router;
