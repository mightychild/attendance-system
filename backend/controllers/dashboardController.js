const User = require('../models/User');
const Course = require('../models/Course');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// @desc    Get comprehensive dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private (Super Admin)
exports.getDashboardStats = catchAsync(async (req, res, next) => {
  try {
    // User statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } }
        }
      }
    ]);

    // Course statistics
    const courseStats = await Course.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalCourses: { $sum: 1 },
          totalCapacity: { $sum: '$maxStudents' },
          totalEnrollment: { $sum: '$currentEnrollment' },
          averageEnrollment: { $avg: '$currentEnrollment' }
        }
      }
    ]);

    // Recent activity (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentUsers = await User.countDocuments({
      createdAt: { $gte: oneWeekAgo }
    });

    const recentCourses = await Course.countDocuments({
      createdAt: { $gte: oneWeekAgo }
    });

    // Format the response
    const formattedUserStats = {
      totalUsers: userStats.reduce((sum, stat) => sum + stat.count, 0),
      superAdmins: userStats.find(stat => stat._id === 'super-admin')?.count || 0,
      lecturers: userStats.find(stat => stat._id === 'lecturer')?.count || 0,
      students: userStats.find(stat => stat._id === 'student')?.count || 0,
      inactiveUsers: userStats.reduce((sum, stat) => sum + (stat.count - stat.active), 0)
    };

    const formattedCourseStats = courseStats[0] || {
      totalCourses: 0,
      totalCapacity: 0,
      totalEnrollment: 0,
      averageEnrollment: 0
    };

    res.status(200).json({
      status: 'success',
      data: {
        userStats: formattedUserStats,
        courseStats: formattedCourseStats,
        recentActivity: {
          recentUsers,
          recentCourses
        },
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard statistics'
    });
  }
});