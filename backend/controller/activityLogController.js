const ActivityLog = require('../model/activityLog');

exports.getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find({ companyId: req.user.companyId })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
