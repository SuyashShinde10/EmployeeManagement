const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  action: {
    type: String,
    required: true // e.g., "Created Task", "Deleted User", "Updated Status"
  },
  details: {
    type: String // e.g., "John updated task 'Build API' to 'In Progress'"
  }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
