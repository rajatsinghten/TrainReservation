const FriendRequest = require('../models/FriendRequest');
const User = require('../models/User');

// Send a friend request
const sendFriendRequest = async (req, res) => {
  try {
    // Check if req.user exists and has an id
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const senderId = req.user.id; // From auth middleware
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID is required'
      });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Check if a request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'A friend request already exists between these users'
      });
    }

    // Create friend request
    const friendRequest = await FriendRequest.create({
      sender: senderId,
      receiver: receiverId,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Friend request sent successfully',
      data: friendRequest
    });
  } catch (error) {
    console.error('Error in sendFriendRequest:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get all friend requests for a user
const getFriendRequests = async (req, res) => {
  try {
    // Check if req.user exists and has an id
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const userId = req.user.id;

    // Find all friend requests where user is the receiver
    const incomingRequests = await FriendRequest.find({
      receiver: userId,
      status: 'pending'
    }).populate('sender', 'username name profession');

    // Find all friend requests where user is the sender
    const outgoingRequests = await FriendRequest.find({
      sender: userId
    }).populate('receiver', 'username name profession');

    res.json({
      success: true,
      data: {
        incoming: incomingRequests,
        outgoing: outgoingRequests
      }
    });
  } catch (error) {
    console.error('Error in getFriendRequests:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Respond to a friend request (accept or reject)
const respondToFriendRequest = async (req, res) => {
  try {
    // Check if req.user exists and has an id
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const userId = req.user.id;
    const { requestId, status } = req.body;

    if (!requestId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Request ID and status are required'
      });
    }

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either accepted or rejected'
      });
    }

    // Find the friend request
    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: 'Friend request not found'
      });
    }

    // Check if the user is the receiver of the request or the sender (if rejecting/canceling)
    const isSender = friendRequest.sender.toString() === userId;
    const isReceiver = friendRequest.receiver.toString() === userId;
    
    // Only allow sender to cancel their own request (reject), or receiver to accept/reject
    if (!(isReceiver || (isSender && status === 'rejected'))) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to perform this action'
      });
    }

    if (status === 'rejected' && isSender) {
      // If sender is canceling the request, delete it
      await FriendRequest.findByIdAndDelete(requestId);
      
      return res.json({
        success: true,
        message: 'Friend request canceled successfully'
      });
    } else {
      // Update request status (for receiver accepting/rejecting)
      friendRequest.status = status;
      await friendRequest.save();
      
      // If accepted, add each user to the other's friends list
      if (status === 'accepted') {
        const sender = await User.findById(friendRequest.sender);
        const receiver = await User.findById(friendRequest.receiver);

        if (!sender.friends.includes(receiver._id)) {
          sender.friends.push(receiver._id);
          await sender.save();
        }

        if (!receiver.friends.includes(sender._id)) {
          receiver.friends.push(sender._id);
          await receiver.save();
        }
      }
      
      return res.json({
        success: true,
        message: `Friend request ${status} successfully`
      });
    }
  } catch (error) {
    console.error('Error in respondToFriendRequest:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get user's friends list
const getFriends = async (req, res) => {
  try {
    // Check if req.user exists and has an id
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const userId = req.user.id;

    // Get user with populated friends
    const user = await User.findById(userId)
      .populate('friends', 'username name profession bio online lastSeen')
      .select('friends');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        friends: user.friends
      }
    });
  } catch (error) {
    console.error('Error in getFriends:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Remove a friend
const removeFriend = async (req, res) => {
  try {
    // Check if req.user exists and has an id
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const userId = req.user.id;
    const { friendId } = req.body;

    if (!friendId) {
      return res.status(400).json({
        success: false,
        message: 'Friend ID is required'
      });
    }

    // Check if friend exists
    const friend = await User.findById(friendId);
    if (!friend) {
      return res.status(404).json({
        success: false,
        message: 'Friend not found'
      });
    }

    // Get current user
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if they are actually friends
    const areFriends = currentUser.friends.includes(friendId) && friend.friends.includes(userId);
    
    if (!areFriends) {
      return res.status(400).json({
        success: false,
        message: 'You are not friends with this user'
      });
    }

    // Remove each user from the other's friends list
    currentUser.friends = currentUser.friends.filter(id => id.toString() !== friendId);
    friend.friends = friend.friends.filter(id => id.toString() !== userId);

    // Save both users
    await currentUser.save();
    await friend.save();

    // Also remove any existing friend requests between them
    await FriendRequest.deleteMany({
      $or: [
        { sender: userId, receiver: friendId },
        { sender: friendId, receiver: userId }
      ]
    });

    res.json({
      success: true,
      message: 'Friend removed successfully'
    });
  } catch (error) {
    console.error('Error in removeFriend:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  sendFriendRequest,
  getFriendRequests,
  respondToFriendRequest,
  getFriends,
  removeFriend
};