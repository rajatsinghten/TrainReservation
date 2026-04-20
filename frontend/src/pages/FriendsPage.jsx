import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance, { isAuthenticated } from '../utils/axios';
import { formatLastSeen } from '../utils/formatters';
import { Navbar } from '../components/layout';
import { PageLoading } from '../components/ui';

const FriendsPage = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [removingFriend, setRemovingFriend] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchFriends();
  }, [navigate]);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/users/friends');
      
      if (response.data.success) {
        setFriends(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = async (friendId, friendName) => {
    if (!window.confirm(`Are you sure you want to remove ${friendName} from your friends?`)) {
      return;
    }

    setRemovingFriend(friendId);

    try {
      const response = await axiosInstance.delete('/api/friends/remove', {
        data: { friendId }
      });
      
      if (response.data.success) {
        setFriends(friends.filter(friend => friend._id !== friendId));
        alert('Friend removed successfully!');
      } else {
        alert('Failed to remove friend. Please try again.');
      }
    } catch (error) {
      console.error('Error removing friend:', error);
      alert('An error occurred while removing friend. Please try again.');
    } finally {
      setRemovingFriend(null);
    }
  };

  const filteredFriends = friends.filter(friend =>
    (friend.name && friend.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (friend.username && friend.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (friend.profession && friend.profession.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return <PageLoading message="Loading friends..." />;
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 pt-24 pb-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-surface-900">My Friends</h1>
            <p className="text-sm text-surface-500 mt-1">
              {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
            </p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="btn-secondary btn-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, username, or profession..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 !rounded-xl"
            />
          </div>
        </div>

        {/* Friends grid */}
        {filteredFriends.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFriends.map(friend => (
              <div
                key={friend._id}
                className="card-hover !rounded-xl p-5"
              >
                <div
                  className="cursor-pointer mb-3"
                  onClick={() => navigate(`/user-profile/${friend._id}`)}
                >
                  <h3 className="font-semibold text-surface-900 truncate">
                    {friend.name || friend.username}
                  </h3>
                  {friend.profession && (
                    <p className="text-xs text-surface-500 mt-0.5">{friend.profession}</p>
                  )}
                  {friend.bio && (
                    <p className="text-xs text-surface-600 italic line-clamp-2 mt-2">{friend.bio}</p>
                  )}
                  <div className="flex items-center gap-1.5 mt-2.5">
                    <span className={`w-2 h-2 rounded-full ${friend.online ? 'bg-accent-500' : 'bg-surface-400'}`} />
                    <span className="text-[11px] text-surface-400">
                      {friend.online ? 'Online' : `${formatLastSeen(friend.lastSeen)}`}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-surface-100">
                  <button
                    onClick={() => navigate(`/chat/${friend._id}`)}
                    className="btn-accent btn-sm flex-1"
                  >
                    Chat
                  </button>
                  <button
                    onClick={() => handleRemoveFriend(friend._id, friend.name || friend.username)}
                    disabled={removingFriend === friend._id}
                    className="btn-ghost btn-sm flex-1 !text-red-500 hover:!bg-red-50"
                  >
                    {removingFriend === friend._id ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-16 gap-4">
            {searchTerm ? (
              <>
                <div className="w-16 h-16 bg-surface-100 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-sm text-surface-500">No friends matching "{searchTerm}"</p>
                <button onClick={() => setSearchTerm('')} className="btn-ghost btn-sm text-primary-600">
                  Clear search
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-surface-100 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-sm text-surface-500 font-medium">No friends yet</p>
                <p className="text-xs text-surface-400">Find travel buddies and send friend requests!</p>
                <button onClick={() => navigate('/')} className="btn-primary btn-sm mt-2">
                  Find Travel Buddies
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;
