const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String, // e.g., 'Task', 'Comment', 'System', 'Leave'
    default: 'System'
  },
  link: {
    type: String // Optional link to redirect when clicked
  },
  isRead: {
    type: Boolean,
    default: false
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
