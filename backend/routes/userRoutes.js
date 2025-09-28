const express = require('express');
const {
  getAllUsers,
  createUser,
  updateUserStatus,
  deleteUser,
  updateUserProfile // ADD THIS IMPORT
} = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// ADD THIS ROUTE
router.patch('/:id/profile', updateUserProfile);

router.use(restrictTo('super-admin'));

router.get('/', getAllUsers);
router.post('/', createUser);
router.patch('/:id/status', updateUserStatus);
router.delete('/:id', deleteUser);

module.exports = router;