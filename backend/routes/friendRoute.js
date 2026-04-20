const express = require('express');
const router = express.Router();
const {
  sendFriendRequest,
  getFriendRequests,
  respondToFriendRequest,
  getFriends,
  removeFriend
} = require('../controllers/friendController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected and require authentication

// Send a friend request
router.post('/request', protect, sendFriendRequest);

// Get all friend requests (incoming and outgoing)
router.get('/requests', protect, getFriendRequests);

// Get user's friends list
router.get('/list', protect, getFriends);

// Respond to a friend request (accept or reject)
router.post('/respond', protect, respondToFriendRequest);

// Remove a friend
router.delete('/remove', protect, removeFriend);

module.exports = router;