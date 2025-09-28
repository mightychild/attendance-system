require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const crypto = require('crypto');

const generateQRHash = (userId, universityId) => {
  const data = `${userId}-${universityId}-${process.env.QR_SECRET || 'attendance-secret'}`;
  return crypto.createHash('sha256').update(data).digest('hex');
};

const migrateQRCodes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/attendanceDB');
    console.log('Connected to MongoDB');

    const students = await User.find({ role: 'student' });
    console.log(`Found ${students.length} students to migrate`);

    let migratedCount = 0;
    
    for (const student of students) {
      if (!student.qrCodeHash) {
        student.qrCodeHash = generateQRHash(student._id.toString(), student.universityId);
        await student.save();
        migratedCount++;
        console.log(`Migrated QR code for: ${student.firstName} ${student.lastName}`);
      }
    }

    console.log(`Migration completed. ${migratedCount} students migrated.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
};

migrateQRCodes();