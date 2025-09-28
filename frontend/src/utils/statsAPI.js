import API from './api';

export const getDashboardStats = async () => {
  try {
    console.log('🔄 Fetching comprehensive dashboard stats...');
    
    const response = await API.get('/admin/dashboard/stats');
    console.log('✅ Dashboard stats received:', response.data);
    return response.data.data;

  } catch (error) {
    console.error('❌ Dashboard stats error:', error);
    
    // Fallback: try individual endpoints
    try {
      console.log('🔄 Trying individual stats endpoints...');
      
      const [courseResponse, userResponse] = await Promise.all([
        API.get('/courses/stats').catch(err => {
          console.error('Course stats fallback failed:', err);
          return { data: { data: getFallbackStats().courseStats } };
        }),
        API.get('/admin/users/stats').catch(err => {
          console.error('User stats fallback failed:', err);
          return { data: { data: getFallbackStats().userStats } };
        })
      ]);

      return {
        userStats: userResponse.data?.data || getFallbackStats().userStats,
        courseStats: courseResponse.data?.data || getFallbackStats().courseStats,
        recentActivity: { recentUsers: 0, recentCourses: 0 },
        lastUpdated: new Date().toISOString()
      };

    } catch (fallbackError) {
      console.error('❌ All stats endpoints failed, using full fallback');
      return getFullFallbackStats();
    }
  }
};

export const getFallbackStats = () => ({
  courseStats: {
    totalCourses: 0,
    totalCapacity: 0,
    totalEnrollment: 0,
    averageEnrollment: 0
  },
  userStats: {
    totalUsers: 0,
    superAdmins: 0,
    lecturers: 0,
    students: 0,
    inactiveUsers: 0
  }
});

export const getFullFallbackStats = () => ({
  userStats: {
    totalUsers: 1, // At least the current super admin
    superAdmins: 1,
    lecturers: 0,
    students: 0,
    inactiveUsers: 0
  },
  courseStats: {
    totalCourses: 0,
    totalCapacity: 0,
    totalEnrollment: 0,
    averageEnrollment: 0
  },
  recentActivity: {
    recentUsers: 0,
    recentCourses: 0
  },
  lastUpdated: new Date().toISOString()
});

// Individual stats functions for components that need specific data
export const getCourseStats = async () => {
  try {
    const response = await API.get('/courses/stats');
    return response.data.data;
  } catch (error) {
    console.error('Course stats error:', error);
    return getFallbackStats().courseStats;
  }
};

export const getUserStats = async () => {
  try {
    const response = await API.get('/admin/users/stats');
    return response.data.data;
  } catch (error) {
    console.error('User stats error:', error);
    return getFallbackStats().userStats;
  }
};