const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['HR', 'Employee'],
    default: 'Employee'
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  team: {
    type: String,
    default: 'General'
  },
  // NEW: Track if employee is Active or Resigned
  status: {
    type: String,
    enum: ['Active', 'Resigned'],
    default: 'Active'
  }
});

module.exports = mongoose.model('User', userSchema);