import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance, { getSocketURL, isAuthenticated } from '../utils/axios';
import { Navbar } from '../components/layout';
import { PageLoading, PageError } from '../components/ui';
import io from 'socket.io-client';

const socket = io(getSocketURL());

const ChatPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    // Get current user's ID
    const loggedInUserId = localStorage.getItem('userId');
    if (loggedInUserId) {
      setCurrentUserId(loggedInUserId);
      
      // Join the chat room
      socket.emit('joinChat', loggedInUserId);
    }
    
    fetchUserData();
    fetchChatHistory();
    
    // Setup socket event listeners
    socket.on('receiveMessage', (message) => {
      // Only add the message if it's from the current chat user
      if (message.sender === userId || message.receiver === userId) {
        setMessages(prevMessages => [...prevMessages, message]);
        
        // Mark the message as read
        markMessagesAsRead();
      }
    });
    
    socket.on('messageSent', (message) => {
      // Add the sent message to the messages list
      setMessages(prevMessages => [...prevMessages, message]);
    });
    
    socket.on('messageError', (error) => {
      console.error('Message error:', error);
    });
    
    // Clean up socket connection on unmount
    return () => {
      socket.off('receiveMessage');
      socket.off('messageSent');
      socket.off('messageError');
    };
  }, [userId, navigate]);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchUserData = async () => {
    try {
      const response = await axiosInstance.get(`/api/users/profile/${userId}`);
      
      if (response.data.success) {
        setUser(response.data.data);
      } else {
        setError('Failed to load user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('An error occurred while loading user data');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchChatHistory = async () => {
    try {
      const response = await axiosInstance.get(`/api/messages/${userId}`);
      
      if (response.data.success) {
        setMessages(response.data.data || []);
        
        // Mark messages as read when chat is opened
        markMessagesAsRead();
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };
  
  const markMessagesAsRead = async () => {
    try {
      await axiosInstance.put(`/api/messages/${userId}/read`);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Function to send a message
  const sendMessage = () => {
    if (!newMessage.trim() || !currentUserId || !user) return;
    
    setSending(true);
    
    const message = {
      sender: currentUserId,
      receiver: userId,
      content: newMessage,
      timestamp: new Date()
    };
    
    socket.emit('sendMessage', message);
    setNewMessage('');
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return <PageLoading message="Loading chat..." />;
  }

  if (error || !user) {
    return <PageError message={error || 'User not found'} />;
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-2 sm:px-4 pt-20 pb-6 animate-fade-in">
        <div className="card overflow-hidden !rounded-2xl">
          {/* Chat header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-base font-bold text-white">{user.name || user.username}</h1>
                <p className="text-xs text-primary-200">Active chat</p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/user-profile/${userId}`)}
              className="text-xs text-primary-200 hover:text-white transition-colors font-medium"
            >
              View Profile
            </button>
          </div>

          {/* Messages area */}
          <div className="bg-surface-50 p-3 sm:p-4 min-h-[300px] max-h-[500px] overflow-y-auto scrollbar-thin">
            {messages.length > 0 ? (
              <div className="space-y-2">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === currentUserId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] px-3.5 py-2.5 rounded-2xl ${
                        msg.sender === currentUserId
                          ? 'bg-primary-600 text-white rounded-br-md'
                          : 'bg-white text-surface-800 border border-surface-200 rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm break-words leading-relaxed">{msg.content}</p>
                      <span className={`text-[10px] block mt-1 ${
                        msg.sender === currentUserId ? 'text-primary-200' : 'text-surface-400'
                      }`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 gap-3">
                <div className="w-12 h-12 bg-surface-100 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-sm text-surface-500">No messages yet</p>
                <p className="text-xs text-surface-400">Start the conversation!</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input */}
          <div className="border-t border-surface-200 p-3 sm:p-4">
            <div className="flex gap-2">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 input !rounded-xl resize-none text-sm"
                placeholder="Type a message..."
                rows={1}
                disabled={sending}
              />
              <button
                onClick={sendMessage}
                disabled={sending || !newMessage.trim()}
                className="btn-primary !rounded-xl px-4 flex-shrink-0 disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-[10px] text-surface-400 mt-1.5">Enter to send, Shift+Enter for new line</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage; 