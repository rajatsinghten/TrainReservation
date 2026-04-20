import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance, { isAuthenticated } from '../utils/axios';
import { formatLastSeen, formatDate } from '../utils/formatters';
import { Navbar } from '../components/layout';
import { PageLoading, PageError } from '../components/ui';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [friendRequests, setFriendRequests] = useState({ incoming: [], outgoing: [] });
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    // Fetch user data
    fetchUserData();
    // Fetch friend requests
    fetchFriendRequests();
    // Fetch friends list
    fetchFriends();
  }, [navigate]);
  
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/users/me');
      
      if (response.data.success) {
        setUserData(response.data.user);
      }
    } catch (error) {
      setError('Failed to fetch user data. Please try again.');
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchFriendRequests = async () => {
    try {
      const response = await axiosInstance.get('/api/friends/requests');
      
      if (response.data.success) {
        setFriendRequests({
          incoming: response.data.data.incoming || [],
          outgoing: response.data.data.outgoing || []
        });
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  const fetchFriends = async () => {
    try {
      setLoadingFriends(true);
      const response = await axiosInstance.get('/api/users/friends');
      
      if (response.data.success) {
        setFriends(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoadingFriends(false);
    }
  };
  
  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await axiosInstance.post('/api/friends/respond', {
        requestId,
        status: 'accepted'
      });
      
      if (response.data.success) {
        // Refresh friend requests after accepting
        fetchFriendRequests();
        // Also refresh the friends list since we've added a new friend
        fetchFriends();
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };
  
  const handleRejectRequest = async (requestId) => {
    try {
      const response = await axiosInstance.post('/api/friends/respond', {
        requestId,
        status: 'rejected'
      });
      
      if (response.data.success) {
        // Refresh friend requests after rejecting
        fetchFriendRequests();
      }
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };
  
  const handleCancelRequest = async (requestId) => {
    try {
      const response = await axiosInstance.post('/api/friends/cancel', {
        requestId
      });
      
      if (response.data.success) {
        // Refresh friend requests after cancelling
        fetchFriendRequests();
      }
    } catch (error) {
      console.error('Error cancelling friend request:', error);
    }
  };
  
  const handleRemoveFriend = async (friendId, friendName) => {
    if (!window.confirm(`Are you sure you want to remove ${friendName} from your friends?`)) {
      return;
    }

    try {
      const response = await axiosInstance.delete('/api/friends/remove', {
        data: { friendId }
      });
      
      if (response.data.success) {
        // Remove the friend from the local state
        setFriends(friends.filter(friend => friend._id !== friendId));
        alert('Friend removed successfully!');
      } else {
        alert('Failed to remove friend. Please try again.');
      }
    } catch (error) {
      console.error('Error removing friend:', error);
      alert('An error occurred while removing friend. Please try again.');
    }
  };
  
  const handleTravelStatusUpdate = (updatedTravelStatus) => {
    // Update the local user data with the new travel status
    setUserData(prevData => ({
      ...prevData,
      travelStatus: updatedTravelStatus
    }));
  };
  
  const viewUserProfile = (userId) => {
    navigate(`/user-profile/${userId}`);
  };
  
  if (loading) {
    return <PageLoading message="Loading dashboard..." />;
  }

  if (error) {
    return <PageError message={error} />;
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-surface-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-sm text-surface-500">No user data found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <div className="max-w-4xl mx-auto py-8 px-4 pt-24 animate-fade-in">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-surface-900">Dashboard</h1>
          <p className="text-sm text-surface-500 mt-1">Manage your profile and connections</p>
        </div>

        {/* Personal Information */}
        <div className="card p-5 md:p-6 mb-5">
          <h2 className="section-title flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Personal Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Username', value: userData.username },
              { label: 'Email', value: userData.email },
              { label: 'Name', value: userData.name },
              { label: 'Age', value: userData.age },
              { label: 'Profession', value: userData.profession },
            ].map(({ label, value }) => (
              <div key={label} className="bg-surface-50 rounded-xl p-3">
                <p className="text-xs font-medium text-surface-500 mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-surface-900">{value || 'Not set'}</p>
              </div>
            ))}
            <div className="md:col-span-2 bg-surface-50 rounded-xl p-3">
              <p className="text-xs font-medium text-surface-500 mb-0.5">Bio</p>
              <p className="text-sm text-surface-800">{userData.bio || 'Not set'}</p>
            </div>
          </div>
        </div>

        {/* Travel Status */}
        <div className="card p-5 md:p-6 mb-5">
          <h2 className="section-title flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Travel Status
          </h2>

          <div className="bg-surface-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-2 h-2 rounded-full ${userData.travelStatus?.isActive ? 'bg-accent-500' : 'bg-surface-400'}`} />
              <span className={`text-sm font-semibold ${userData.travelStatus?.isActive ? 'text-accent-700' : 'text-surface-500'}`}>
                {userData.travelStatus?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { label: 'Travel Date', value: userData.travelStatus?.travelDate ? formatDate(userData.travelStatus.travelDate) : null },
                { label: 'Boarding Station', value: userData.travelStatus?.boardingStation },
                { label: 'Destination Station', value: userData.travelStatus?.destinationStation },
                { label: 'Train', value: userData.travelStatus?.trainNumber },
                { label: 'Class', value: userData.travelStatus?.preferredClass },
              ].filter(item => item.value).map(({ label, value }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-xs text-surface-500">{label}:</span>
                  <span className="text-sm font-medium text-surface-800">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Friend Requests */}
        <div className="card p-5 md:p-6 mb-5">
          <h2 className="section-title flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Friend Requests
          </h2>

          {/* Incoming */}
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-surface-700 mb-2 flex items-center gap-2">
              Incoming
              {friendRequests.incoming.length > 0 && (
                <span className="badge-danger text-[10px]">{friendRequests.incoming.length}</span>
              )}
            </h3>

            {friendRequests.incoming.length > 0 ? (
              <div className="space-y-2">
                {friendRequests.incoming.map(request => (
                  <div key={request._id} className="flex items-center justify-between p-3 bg-surface-50 rounded-xl">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => viewUserProfile(request.sender._id)}>
                      <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary-600">
                          {(request.sender.name || request.sender.username || '?').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-surface-900">{request.sender.name || request.sender.username}</p>
                        {request.sender.profession && (
                          <p className="text-xs text-surface-500">{request.sender.profession}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => handleAcceptRequest(request._id)} className="btn-accent btn-xs">Accept</button>
                      <button onClick={() => handleRejectRequest(request._id)} className="btn-ghost btn-xs !text-red-500 hover:!bg-red-50">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-surface-400 italic py-2">No incoming requests</p>
            )}
          </div>

          {/* Outgoing */}
          <div>
            <h3 className="text-sm font-semibold text-surface-700 mb-2 flex items-center gap-2">
              Sent
              {friendRequests.outgoing.length > 0 && (
                <span className="badge-primary text-[10px]">{friendRequests.outgoing.length}</span>
              )}
            </h3>

            {friendRequests.outgoing.length > 0 ? (
              <div className="space-y-2">
                {friendRequests.outgoing.map(request => (
                  <div key={request._id} className="flex items-center justify-between p-3 bg-surface-50 rounded-xl">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => viewUserProfile(request.receiver._id)}>
                      <div className="w-9 h-9 rounded-xl bg-surface-200 flex items-center justify-center">
                        <span className="text-xs font-bold text-surface-600">
                          {(request.receiver.name || request.receiver.username || '?').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-surface-900">{request.receiver.name || request.receiver.username}</p>
                        <p className="text-[10px] text-surface-400 capitalize">{request.status}</p>
                      </div>
                    </div>
                    {request.status === 'pending' && (
                      <button onClick={() => handleCancelRequest(request._id)} className="btn-ghost btn-xs">Cancel</button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-surface-400 italic py-2">No sent requests</p>
            )}
          </div>
        </div>

        {/* Friends List */}
        <div className="card p-5 md:p-6 mb-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="section-title flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              My Friends
              {friends.length > 0 && (
                <span className="badge-accent text-[10px]">{friends.length}</span>
              )}
            </h2>
            {friends.length > 0 && (
              <button onClick={() => navigate('/friends')} className="btn-secondary btn-sm">
                View All
              </button>
            )}
          </div>

          {loadingFriends ? (
            <div className="flex flex-col items-center py-8 gap-2">
              <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
              <p className="text-xs text-surface-500">Loading friends...</p>
            </div>
          ) : friends.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {friends.map(friend => (
                <div
                  key={friend._id}
                  className="bg-surface-50 p-3.5 rounded-xl hover:bg-surface-100 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0" onClick={() => viewUserProfile(friend._id)}>
                      <p className="text-sm font-semibold text-surface-900 truncate">{friend.name || friend.username}</p>
                      {friend.profession && (
                        <p className="text-xs text-surface-500 truncate">{friend.profession}</p>
                      )}
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${friend.online ? 'bg-accent-500' : 'bg-surface-400'}`} />
                        <span className="text-[10px] text-surface-400">
                          {friend.online ? 'Online' : `${formatLastSeen(friend.lastSeen)}`}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/chat/${friend._id}`); }}
                        className="btn-accent btn-xs"
                      >
                        Chat
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveFriend(friend._id, friend.name || friend.username); }}
                        className="btn-ghost btn-xs !text-red-500 hover:!bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-10 gap-3">
              <div className="w-14 h-14 bg-surface-100 rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-sm text-surface-500">No friends yet</p>
              <p className="text-xs text-surface-400">Find travel buddies to connect with!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;