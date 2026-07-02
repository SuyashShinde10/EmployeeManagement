const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Assigned', 'In Progress', 'Completed'],
    default: 'Pending'
  },
  taskType: {
    type: String,
    enum: ['Individual', 'Team'],
    default: 'Individual'
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // NEW: Tracks which specific employees have marked it as done
  completedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // NEW: Tracks which specific employees have accepted/started working on it
  acceptedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  acceptedAt: { type: Date },
  completedAt: { type: Date },

  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],

  memberHistory: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    acceptedAt: { type: Date },
    completedAt: { type: Date }
  }],
  subtasks: [{
    title: { type: String, required: true },
    isCompleted: { type: Boolean, default: false }
  }],
  attachments: [{
    public_id: String,
    url: String,
    filename: String
  }]

}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);