const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required'],
    validate: {
      validator: async function(studentId) {
        const User = mongoose.model('User');
        const student = await User.findById(studentId);
        return student && student.role === 'student';
      },
      message: 'Enrollment must be for a student'
    }
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['enrolled', 'dropped', 'completed'],
    default: 'enrolled'
  },
  attendance: [{
    date: {
      type: Date,
      required: true
    },
    present: {
      type: Boolean,
      default: false
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  totalClasses: {
    type: Number,
    default: 0
  },
  classesAttended: {
    type: Number,
    default: 0
  },
  attendancePercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate enrollments
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

// Pre-save middleware to calculate attendance percentage
enrollmentSchema.pre('save', function(next) {
  if (this.totalClasses > 0) {
    this.attendancePercentage = (this.classesAttended / this.totalClasses) * 100;
  } else {
    this.attendancePercentage = 0;
  }
  next();
});

// Static method to check if student is enrolled in course
enrollmentSchema.statics.isStudentEnrolled = async function(studentId, courseId) {
  const enrollment = await this.findOne({
    student: studentId,
    course: courseId,
    status: 'enrolled'
  });
  return !!enrollment;
};

// Instance method to mark attendance
enrollmentSchema.methods.markAttendance = function(date, present, recordedBy) {
  const attendanceRecord = {
    date,
    present,
    recordedBy
  };

  // Remove existing record for the same date if it exists
  this.attendance = this.attendance.filter(record => 
    record.date.toDateString() !== date.toDateString()
  );

  this.attendance.push(attendanceRecord);
  
  // Update totals
  this.totalClasses = this.attendance.length;
  this.classesAttended = this.attendance.filter(record => record.present).length;
};

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

module.exports = Enrollment;