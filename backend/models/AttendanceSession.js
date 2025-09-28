const mongoose = require('mongoose');

const attendanceSessionSchema = new mongoose.Schema({
  lecturer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  course: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  startTime: { 
    type: Date, 
    default: Date.now 
  },
  endTime: { 
    type: Date 
  },
  duration: {
    type: Number, // Duration in minutes
    default: 30   // Default 30-minute session
  },
  status: { 
    type: String, 
    enum: ['active', 'completed'], 
    default: 'active' 
  },
  attendees: [{
    student: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true 
    },
    scannedAt: { 
      type: Date, 
      default: Date.now 
    },
    markedManually: { 
      type: Boolean, 
      default: false 
    },
    attendanceType: {
      type: String,
      enum: ['present', 'absent', 'excused'],
      default: 'present'
    }
  }],
  autoMarkedAbsences: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

// Index for better query performance
attendanceSessionSchema.index({ lecturer: 1 });
attendanceSessionSchema.index({ course: 1 });
attendanceSessionSchema.index({ status: 1 });
attendanceSessionSchema.index({ createdAt: 1 });

// Virtual to check if session is active
attendanceSessionSchema.virtual('isActive').get(function() {
  return this.status === 'active' && (!this.endTime || this.endTime > new Date());
});

// Method to add a student to attendees
attendanceSessionSchema.methods.addAttendee = function(studentId, markedManually = false) {
  // Check if student already exists in attendees
  const existingAttendee = this.attendees.find(attendee => 
    attendee.student.toString() === studentId.toString()
  );
  
  if (!existingAttendee) {
    this.attendees.push({
      student: studentId,
      markedManually,
      scannedAt: new Date()
    });
  }
  
  return this.save();
};

// Method to mark session as completed
attendanceSessionSchema.methods.completeSession = function() {
  this.status = 'completed';
  this.endTime = new Date();
  return this.save();
};

const AttendanceSession = mongoose.model('AttendanceSession', attendanceSessionSchema);

module.exports = AttendanceSession;