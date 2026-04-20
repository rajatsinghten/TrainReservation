import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { Navbar } from '../components/layout';
import { PageLoading, PageError } from '../components/ui';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestStatus, setRequestStatus] = useState(null);
  const [requestId, setRequestId] = useState(null);
  const [processingRequest, setProcessingRequest] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    checkFriendRequestStatus();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axiosInstance.get(`/api/users/profile/${userId}`);
      
      if (response.data.success) {
        setUser(response.data.data);
      } else {
        setError('Failed to load user profile');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('An error occurred while loading the profile');
    } finally {
      setLoading(false);
    }
  };

  const checkFriendRequestStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // First, check if the user is already a friend
      const meResponse = await axiosInstance.get('/api/users/me');
      
      if (meResponse.data.success && meResponse.data.user.friends) {
        // Convert ObjectIds to strings for comparison
        const friends = meResponse.data.user.friends;
        const isFriend = friends.some(friendId => 
          friendId.toString() === userId.toString() || 
          friendId === userId
        );
        
        if (isFriend) {
          setRequestStatus('friends');
          return;
        }
      }

      // If not a friend, check friend requests
      const response = await axiosInstance.get('/api/friends/requests');
      
      if (response.data.success) {
        // Check outgoing requests (both pending and accepted)
        const outgoingRequest = response.data.data.outgoing.find(
          req => req.receiver._id === userId
        );
        
        if (outgoingRequest) {
          if (outgoingRequest.status === 'accepted') {
            setRequestStatus('friends');
          } else {
            setRequestStatus('outgoing');
            setRequestId(outgoingRequest._id);
          }
          return;
        }

        // Check incoming requests (both pending and accepted)
        const incomingRequest = response.data.data.incoming.find(
          req => req.sender._id === userId
        );
        
        if (incomingRequest) {
          if (incomingRequest.status === 'accepted') {
            setRequestStatus('friends');
          } else {
            setRequestStatus('incoming');
            setRequestId(incomingRequest._id);
          }
          return;
        }

        setRequestStatus('none');
      }
    } catch (error) {
      console.error('Error checking friend request status:', error);
    }
  };

  const handleFriendRequest = async (action) => {
    setProcessingRequest(true);
    
    try {
      let response;
      
      if (action === 'send') {
        // Send a new friend request
        response = await axiosInstance.post('/api/friends/request', {
          receiverId: userId
        });
        
        if (response.data.success) {
          setRequestStatus('outgoing');
          setRequestId(response.data.data._id);
        }
      } else if (action === 'cancel' || action === 'reject') {
        // Cancel an outgoing request or reject an incoming request
        response = await axiosInstance.post('/api/friends/respond', {
          requestId: requestId,
          status: 'rejected'
        });
        
        if (response.data.success) {
          setRequestStatus('none');
          setRequestId(null);
        }
      } else if (action === 'accept') {
        // Accept an incoming request
        response = await axiosInstance.post('/api/friends/respond', {
          requestId: requestId,
          status: 'accepted'
        });
        
        if (response.data.success) {
          setRequestStatus('friends');
          setRequestId(null);
          
          // Refresh user data to update friends list
          setTimeout(() => {
            checkFriendRequestStatus();
          }, 500);
        }
      }
    } catch (error) {
      console.error('Error handling friend request:', error);
    } finally {
      setProcessingRequest(false);
    }
  };

  const navigateToChat = () => {
    navigate(`/chat/${userId}`);
  };

  const handleRemoveFriend = async () => {
    if (!window.confirm('Are you sure you want to remove this friend?')) {
      return;
    }

    setProcessingRequest(true);
    
    try {
      const response = await axiosInstance.delete('/api/friends/remove', {
        data: { friendId: userId }
      });
      
      if (response.data.success) {
        setRequestStatus('none');
        setRequestId(null);
        // Show a success message or update UI as needed
        alert('Friend removed successfully!');
      } else {
        alert('Failed to remove friend. Please try again.');
      }
    } catch (error) {
      console.error('Error removing friend:', error);
      alert('An error occurred while removing friend. Please try again.');
    } finally {
      setProcessingRequest(false);
    }
  };

  if (loading) {
    return <PageLoading message="Loading profile..." />;
  }

  if (error || !user) {
    return <PageError message={error || 'User not found'} />;
  }

  // Avatar
  const initials = user.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-8 animate-fade-in">
        <div className="card overflow-hidden !rounded-2xl">
          {/* Profile header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8 text-white">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-white">{initials}</span>
              </div>
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                {user.profession && (
                  <p className="text-primary-200 mt-1">{user.profession}</p>
                )}
              </div>

              {/* Friend action buttons */}
              <div className="flex gap-2 flex-shrink-0">
                {requestStatus === 'none' && (
                  <button
                    onClick={() => handleFriendRequest('send')}
                    disabled={processingRequest}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                  >
                    {processingRequest ? 'Sending...' : 'Add Friend'}
                  </button>
                )}

                {requestStatus === 'outgoing' && (
                  <button
                    onClick={() => handleFriendRequest('cancel')}
                    disabled={processingRequest}
                    className="bg-red-500/20 hover:bg-red-500/30 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                  >
                    {processingRequest ? 'Cancelling...' : 'Cancel Request'}
                  </button>
                )}

                {requestStatus === 'incoming' && (
                  <>
                    <button
                      onClick={() => handleFriendRequest('accept')}
                      disabled={processingRequest}
                      className="bg-accent-500/20 hover:bg-accent-500/30 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                    >
                      {processingRequest ? '...' : 'Accept'}
                    </button>
                    <button
                      onClick={() => handleFriendRequest('reject')}
                      disabled={processingRequest}
                      className="bg-red-500/20 hover:bg-red-500/30 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </>
                )}

                {requestStatus === 'friends' && (
                  <>
                    <span className="badge-accent">Friends</span>
                    <button onClick={navigateToChat} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all">
                      Chat
                    </button>
                    <button
                      onClick={handleRemoveFriend}
                      disabled={processingRequest}
                      className="bg-red-500/20 hover:bg-red-500/30 text-white px-3 py-2 rounded-xl text-sm transition-all disabled:opacity-50"
                    >
                      {processingRequest ? '...' : 'Remove'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Profile content */}
          <div className="p-5 md:p-6">
            <h2 className="section-title mb-4">Profile Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { label: 'Username', value: user.username },
                { label: 'Age', value: user.age },
                { label: 'Email', value: user.email },
                { label: 'Phone', value: user.phone },
              ].filter(item => item.value).map(({ label, value }) => (
                <div key={label} className="bg-surface-50 rounded-xl p-3">
                  <p className="text-xs font-medium text-surface-500 mb-0.5">{label}</p>
                  <p className="text-sm font-semibold text-surface-900">{value}</p>
                </div>
              ))}
            </div>

            {user.bio && (
              <div className="mt-4 bg-surface-50 rounded-xl p-3">
                <p className="text-xs font-medium text-surface-500 mb-1">Bio</p>
                <p className="text-sm text-surface-800 whitespace-pre-line">{user.bio}</p>
              </div>
            )}

            {/* Travel Status */}
            {user.travelStatus && user.travelStatus.boardingStation && user.travelStatus.isActive && (
              <div className="mt-6">
                <h3 className="text-sm font-bold text-surface-900 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Current Travel
                </h3>

                <div className="bg-primary-50/60 rounded-xl p-4 border border-primary-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-surface-800">{user.travelStatus.boardingStation}</p>
                    </div>
                    <div className="flex items-center mx-3">
                      <div className="w-2 h-2 rounded-full bg-primary-400" />
                      <div className="w-10 h-px bg-primary-300" />
                      <svg className="w-3 h-3 text-primary-400 -ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-sm font-semibold text-surface-800">{user.travelStatus.destinationStation}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-primary-100">
                    <span className="text-xs text-primary-700 bg-primary-100 px-2 py-1 rounded-md">
                      {new Date(user.travelStatus.travelDate).toLocaleDateString()}
                    </span>
                    {user.travelStatus.trainNumber && (
                      <span className="text-xs text-primary-700 bg-primary-100 px-2 py-1 rounded-md">
                        Train: {user.travelStatus.trainNumber}
                      </span>
                    )}
                    {user.travelStatus.preferredClass && (
                      <span className="badge-primary text-[10px]">
                        {user.travelStatus.preferredClass}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;