const Review = require('../model/review');
const User = require('../model/user');

exports.createReview = async (req, res) => {
  try {
    if (req.user.role !== 'PM') {
      return res.status(403).json({ error: 'Only PMs can create reviews' });
    }

    const { employeeId, period, rating, feedback } = req.body;
    
    // Check if employee exists and belongs to company
    const employee = await User.findOne({ _id: employeeId, companyId: req.user.companyId });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found in this company' });
    }

    const review = new Review({
      employee: employeeId,
      reviewer: req.user.id,
      companyId: req.user.companyId,
      period,
      rating,
      feedback
    });
    
    await review.save();
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCompanyReviews = async (req, res) => {
  try {
    if (req.user.role !== 'PM') {
      return res.status(403).json({ error: 'Only PMs can view all company reviews' });
    }
    const reviews = await Review.find({ companyId: req.user.companyId })
      .populate('employee', 'name email team')
      .populate('reviewer', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ employee: req.user.id })
      .populate('reviewer', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
