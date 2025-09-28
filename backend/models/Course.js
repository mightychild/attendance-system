const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    required: [true, 'Course code is required'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: 20
  },
  courseName: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  credits: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  lecturer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Lecturer assignment is required'],
    validate: {
      validator: async function(lecturerId) {
        const User = mongoose.model('User');
        const lecturer = await User.findById(lecturerId);
        return lecturer && lecturer.role === 'lecturer';
      },
      message: 'Assigned user must be a lecturer'
    }
  },
  schedule: {
    days: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    }],
    startTime: {
      type: String,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
    },
    endTime: {
      type: String,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
    },
    room: String
  },
  semester: {
    type: String,
    required: true,
    enum: ['First Semester', 'Second Semester']
  },
  academicYear: {
    type: String,
    required: true,
    match: /^[0-9]{4}-[0-9]{4}$/ // e.g., 2023-2024
  },
  isActive: {
    type: Boolean,
    default: true
  },
  maxStudents: {
    type: Number,
    min: 1,
    max: 300
  },
  currentEnrollment: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
courseSchema.index({ courseCode: 1 });
courseSchema.index({ lecturer: 1 });
courseSchema.index({ isActive: 1 });

// Virtual for checking if course is full
courseSchema.virtual('isFull').get(function() {
  return this.currentEnrollment >= this.maxStudents;
});

// Method to check enrollment status
courseSchema.methods.canEnroll = function() {
  return this.isActive && !this.isFull;
};

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;