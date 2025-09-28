const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phoneNumber: {
    type: String,
    trim: true,
    match: [/^\+?[0-9]{10,15}$/, 'Please provide a valid phone number']
  },
  universityId: {
    type: String,
    sparse: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    required: true,
    enum: ['super-admin', 'lecturer', 'student'],
    default: 'student'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  qrSecret: {
    type: String,
    unique: true,
    sparse: true,
    select: false
  },
  coursesTeaching: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  coursesEnrolled: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Generate QR secret if it doesn't exist (for new users)
  if (this.isNew && !this.qrSecret) {
    this.qrSecret = require('crypto').randomBytes(32).toString('hex');
  }
  
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Check password method
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Check if universityId is taken
userSchema.statics.isUniversityIdTaken = async function(universityId, role, excludeUserId) {
  if (!universityId) return false;
  const query = { universityId, role };
  if (excludeUserId) query._id = { $ne: excludeUserId };
  const user = await this.findOne(query);
  return !!user;
};

module.exports = mongoose.model('User', userSchema);