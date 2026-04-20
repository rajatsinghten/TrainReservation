const express = require("express");
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  logoutUser,
  getCurrentUser,
  updateProfile,
  updateTravelStatus,
  findTravelBuddies,
  getUserById,
  getUserFriends
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Route to register a new user
router.post('/register', registerUser);

// Route to login a user
router.post('/login', loginUser);

// Route to logout a user
router.post('/logout', logoutUser);

// Get current user (protected route)
router.get('/me', protect, getCurrentUser);

// Update user profile (protected route)
router.put('/profile', protect, updateProfile);

// Update travel status (protected route)
router.put('/travel-status', protect, updateTravelStatus);

// Get user by ID (protected route)
router.get('/profile/:id', protect, getUserById);

// Get user's friends with details (protected route)
router.get('/friends', protect, getUserFriends);

// Find travel buddies (protected route)
router.get('/travel-buddies', protect, findTravelBuddies);

module.exports = router;

