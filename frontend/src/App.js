import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import urbanTheme from './styles/theme';
import { Box, Typography, CircularProgress } from '@mui/material';

// Auth Pages
import Login from './pages/Login';
import Signup from './pages/Signup';

// Dashboard Pages
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import LecturerDashboard from './pages/LecturerDashboard';
import StudentDashboard from './pages/StudentDashboard';

// Admin Pages
import AdminUsers from './pages/admin/AdminUsers';
import AdminCourses from './pages/admin/AdminCourses';
import AdminReports from './pages/admin/AdminReports';

// Lecturer Pages
import LecturerScan from './pages/lecturer/LecturerScan';
import LecturerCourses from './pages/lecturer/LecturerCourses';
import LecturerReports from './pages/lecturer/LecturerReports'; // NEW
import LecturerProfile from './pages/lecturer/LecturerProfile'; // NEW

// Student Pages
import StudentAttendance from './pages/student/StudentAttendance';
import StudentProfile from './pages/student/StudentProfile';
import StudentCourses from './pages/student/StudentCourses';

// Layout
import DashboardLayout from './layout/DashboardLayout';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CssBaseline />
        <CircularProgress />
      </Box>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

// Role-based Dashboard Redirector
const RoleBasedDashboard = () => {
  const { user } = useAuth();
  
  switch (user?.role) {
    case 'super-admin':
      return <SuperAdminDashboard />;
    case 'lecturer':
      return <LecturerDashboard />;
    case 'student':
      return <StudentDashboard />;
    default:
      return (
        <DashboardLayout>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <Typography variant="h6" color="error">
              Unknown user role. Please contact administrator.
            </Typography>
          </Box>
        </DashboardLayout>
      );
  }
};

function App() {
  return (
    <ThemeProvider theme={urbanTheme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Main Dashboard Route - Auto-redirects based on role */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <RoleBasedDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Super Admin Routes */}
              <Route 
                path="/admin/users" 
                element={
                  <ProtectedRoute requiredRole="super-admin">
                    <AdminUsers />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/courses" 
                element={
                  <ProtectedRoute requiredRole="super-admin">
                    <AdminCourses />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/reports" 
                element={
                  <ProtectedRoute requiredRole="super-admin">
                    <AdminReports />
                  </ProtectedRoute>
                } 
              />
              
              {/* Lecturer Routes */}
              <Route 
                path="/lecturer/scan" 
                element={
                  <ProtectedRoute requiredRole="lecturer">
                    <LecturerScan />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/lecturer/courses" 
                element={
                  <ProtectedRoute requiredRole="lecturer">
                    <LecturerCourses />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/lecturer/reports" 
                element={
                  <ProtectedRoute requiredRole="lecturer">
                    <LecturerReports />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/lecturer/profile" 
                element={
                  <ProtectedRoute requiredRole="lecturer">
                    <LecturerProfile />
                  </ProtectedRoute>
                } 
              />
              
              {/* Student Routes */}
              <Route 
                path="/student/attendance" 
                element={
                  <ProtectedRoute requiredRole="student">
                    <StudentAttendance />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/student/courses" 
                element={
                  <ProtectedRoute requiredRole="student">
                    <StudentCourses />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/student/profile" 
                element={
                  <ProtectedRoute requiredRole="student">
                    <StudentProfile />
                  </ProtectedRoute>
                } 
              />
              
              {/* Default route */}
              <Route path="/" element={<Navigate to="/dashboard" />} />
              
              {/* Catch all route - 404 */}
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;