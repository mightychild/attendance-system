import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import DashboardLayout from '../../layout/DashboardLayout';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { getUsers, createUser, updateUserStatus, deleteUser } from '../../utils/userAPI';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    userId: null,
    action: null,
    title: '',
    message: '',
    type: 'warning'
  });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    universityId: '',
    password: '',
    role: 'lecturer'
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getUsers({ 
        page: page + 1, 
        limit: rowsPerPage, 
        search: searchTerm, 
        role: roleFilter 
      });
      setUsers(response.data.users);
      setTotalUsers(response.total);
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, searchTerm, roleFilter]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const showConfirmation = (userId, action, title, message, type = 'warning') => {
    setConfirmDialog({
      open: true,
      userId,
      action,
      title,
      message,
      type
    });
  };

  const handleConfirm = async () => {
    const { userId, action } = confirmDialog;
    
    try {
      if (action === 'delete') {
        // Optimistic update: remove user immediately
        setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
        
        await deleteUser(userId);
        setSuccess('User deleted successfully');
      } else if (action === 'toggleStatus') {
        const user = users.find(u => u._id === userId);
        const newStatus = !user.isActive;
        
        // Optimistic update: update status immediately
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === userId ? { ...user, isActive: newStatus } : user
          )
        );
        
        await updateUserStatus(userId, newStatus);
        setSuccess(`User ${newStatus ? 'activated' : 'deactivated'} successfully`);
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} user`);
      // Revert optimistic update on error
      fetchUsers();
    } finally {
      setConfirmDialog({ open: false, userId: null, action: null, title: '', message: '', type: 'warning' });
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleToggleStatus = (userId, currentStatus) => {
    showConfirmation(
      userId,
      'toggleStatus',
      currentStatus ? 'Deactivate User' : 'Activate User',
      currentStatus 
        ? 'Are you sure you want to deactivate this user? They will not be able to access the system.'
        : 'Are you sure you want to activate this user? They will be able to access the system.',
      currentStatus ? 'warning' : 'info'
    );
  };

  const handleDeleteUser = (userId) => {
    showConfirmation(
      userId,
      'delete',
      'Delete User',
      'Are you sure you want to delete this user? This action cannot be undone.',
      'delete'
    );
  };

  const handleCreateUser = async () => {
    try {
      setDialogLoading(true);
      await createUser(formData);
      setOpenDialog(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        universityId: '',
        password: '',
        role: 'lecturer'
      });
      // Refresh the list immediately
      await fetchUsers();
      setSuccess('User created successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setDialogLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'super-admin': return 'secondary';
      case 'lecturer': return 'primary';
      case 'student': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'success' : 'error';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1" color="primary.main">
            Manage Users
          </Typography>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Add User
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box display="flex" gap={2} alignItems="center">
            <TextField
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ minWidth: 200 }}
            />
            <TextField
              select
              label="Filter by Role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">All Roles</MenuItem>
              <MenuItem value="super-admin">Super Admin</MenuItem>
              <MenuItem value="lecturer">Lecturer</MenuItem>
              <MenuItem value="student">Student</MenuItem>
            </TextField>
          </Box>
        </Paper>

        {/* Users Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.universityId || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={getRoleColor(user.role)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? 'Active' : 'Inactive'}
                      color={getStatusColor(user.isActive)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Toggle Status">
                      <Switch
                        checked={user.isActive}
                        onChange={() => handleToggleStatus(user._id, user.isActive)}
                        color="success"
                      />
                    </Tooltip>
                    <Tooltip title="Delete User">
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteUser(user._id)}
                        disabled={user.role === 'super-admin'}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalUsers}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />

        {/* Create User Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
              <PersonAddIcon />
              Create New User
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2} mt={1}>
              <TextField
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              <TextField
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
              <TextField
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <TextField
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <TextField
                select
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <MenuItem value="lecturer">Lecturer</MenuItem>
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="super-admin">Super Admin</MenuItem>
              </TextField>
              {formData.role !== 'super-admin' && (
                <TextField
                  label={formData.role === 'lecturer' ? 'Staff ID' : 'Student ID'}
                  name="universityId"
                  value={formData.universityId}
                  onChange={handleChange}
                  required
                />
              )}
              {/* ADD PHONE NUMBER FIELD FOR LECTURERS */}
              {formData.role === 'lecturer' && (
                <TextField
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+1234567890"
                  helperText="Format: +1234567890 (10-15 digits)"
                />
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button
              onClick={handleCreateUser}
              variant="contained"
              disabled={dialogLoading}
              startIcon={dialogLoading ? <CircularProgress size={20} /> : <AddIcon />}
            >
              Create User
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          open={confirmDialog.open}
          onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
          onConfirm={handleConfirm}
          title={confirmDialog.title}
          message={confirmDialog.message}
          type={confirmDialog.type}
          confirmText="Confirm"
          cancelText="Cancel"
        />

        {users.length === 0 && !loading && (
          <Paper sx={{ p: 4, textAlign: 'center', mt: 2 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No users found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm || roleFilter !== 'all'
                ? 'Try adjusting your search filters'
                : 'No users found in the system'
              }
            </Typography>
          </Paper>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default AdminUsers;