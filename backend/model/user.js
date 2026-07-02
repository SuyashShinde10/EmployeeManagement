const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
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
    enum: ['General', 'Frontend', 'Backend', 'QA', 'Marketing'],
    default: 'General'
  },
  status: {
    type: String,
    enum: ['Active', 'Resigned'],
    default: 'Active'
  },
  isPasswordTemp: {
    type: Boolean,
    default: false
  }
});

// Pre-save hook: auto-hash password before saving
userSchema.pre('save', async function () {
  // Only hash if the password field was modified
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Pre-findOneAndUpdate hook: hash password if being updated
userSchema.pre('findOneAndUpdate', async function () {
  const update = this.getUpdate();
  if (update && update.password) {
    const salt = await bcrypt.genSalt(12);
    update.password = await bcrypt.hash(update.password, salt);
  }
});

// Instance method: compare a plain-text password against the stored hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);