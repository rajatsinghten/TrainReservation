const Message = require('../models/Message');

// Get chat history between two users
const getChatHistory = async (req, res) => {
  try {
    // Check if req.user exists and has an id
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Find messages where the current user is either the sender or receiver
    // and the other user is either the receiver or sender
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    }).sort({ timestamp: 1 }); // Sort by timestamp to show messages in order

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error getting chat history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Send a message (for non-socket methods)
const sendMessage = async (req, res) => {
  try {
    // Check if req.user exists and has an id
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { receiverId, content } = req.body;
    const senderId = req.user.id;

    if (!receiverId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID and content are required'
      });
    }

    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      content,
      timestamp: new Date()
    });

    await newMessage.save();

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Mark messages as read
const markMessagesAsRead = async (req, res) => {
  try {
    // Check if req.user exists and has an id
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Find all unread messages sent by the other user to the current user
    await Message.updateMany(
      { sender: userId, receiver: currentUserId, read: false },
      { $set: { read: true } }
    );

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getChatHistory,
  sendMessage,
  markMessagesAsRead
}; 