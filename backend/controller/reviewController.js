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

    const Notification = require('../model/notification');
    const notification = new Notification({
      user: employeeId,
      message: `You have received a new performance review for ${period} with a rating of ${rating}/5.`,
      companyId: req.user.companyId
    });
    await notification.save();

    const populatedReview = await Review.findById(review._id)
      .populate('employee', 'name email team')
      .populate('reviewer', 'name');

    const io = req.app.get('socketio');
    if (io) {
      io.to(req.user.companyId.toString()).emit('new_review', populatedReview);
      io.to(req.user.companyId.toString()).emit('new_notification', notification);
    }

    res.status(201).json(populatedReview);
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
