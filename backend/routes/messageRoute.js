const express = require('express');
const router = express.Router();
const { getChatHistory, sendMessage, markMessagesAsRead } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// Get chat history with a specific user
router.get('/:userId', protect, getChatHistory);

// Send a message (HTTP method, as alternative to socket)
router.post('/send', protect, sendMessage);

// Mark messages as read
router.put('/:userId/read', protect, markMessagesAsRead);

module.exports = router; 