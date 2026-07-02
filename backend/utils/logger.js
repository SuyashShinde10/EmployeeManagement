const ActivityLog = require('../model/activityLog');

const logActivity = async (userId, companyId, action, details) => {
  try {
    const log = new ActivityLog({
      user: userId,
      companyId,
      action,
      details
    });
    await log.save();
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

module.exports = logActivity;
