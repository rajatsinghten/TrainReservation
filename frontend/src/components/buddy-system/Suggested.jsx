import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axios';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../ui';

const Suggested = ({ id, name, profession, bio, isFriend: initialIsFriend, travelDetails }) => {
  const [inviting, setInviting] = useState(false);
  const [invited, setInvited] = useState(false);
  const [isFriend, setIsFriend] = useState(initialIsFriend || false);
  const [error, setError] = useState(null);
  const [requestId, setRequestId] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isFriend) {
      checkExistingRequest();
      checkFriendshipStatus();
    }
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const checkExistingRequest = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await axiosInstance.get('/api/friends/requests');

      if (response.data.success) {
        const { outgoing, incoming } = response.data.data;

        const outgoingPendingRequest = outgoing.find(
          req => req.receiver._id === id && req.status === 'pending'
        );

        if (outgoingPendingRequest) {
          setInvited(true);
          setRequestId(outgoingPendingRequest._id);
        }

        const outgoingAcceptedRequest = outgoing.find(
          req => req.receiver._id === id && req.status === 'accepted'
        );
        const incomingAcceptedRequest = incoming.find(
          req => req.sender._id === id && req.status === 'accepted'
        );

        if (outgoingAcceptedRequest || incomingAcceptedRequest) {
          setIsFriend(true);
        }
      }
    } catch (error) {
      console.error('Error checking existing request:', error);
    }
  };

  const checkFriendshipStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axiosInstance.get('/api/users/me');

      if (response.data.success && response.data.user.friends) {
        const isFriendFound = response.data.user.friends.some(
          friendId => friendId.toString() === id.toString()
        );

        if (isFriendFound) {
          setIsFriend(true);
        }
      }
    } catch (error) {
      console.error('Error checking friendship status:', error);
    }
  };

  const handleInvite = async () => {
    if (invited && requestId) return handleDeleteRequest();

    setInviting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Please login to send an invitation");
        setInviting(false);
        return;
      }

      const response = await axiosInstance.post('/api/friends/request', { receiverId: id });

      if (response.data.success) {
        setInvited(true);
        setRequestId(response.data.data._id);
        setSuccessMessage('Invitation sent successfully!');
      } else {
        setError(response.data.message || 'Failed to send invitation');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setInviting(false);
    }
  };

  const handleDeleteRequest = async () => {
    setInviting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await axiosInstance.post('/api/friends/respond', {
        requestId,
        status: 'rejected',
      });

      if (response.data.success) {
        setInvited(false);
        setRequestId(null);
        setSuccessMessage('Invitation deleted successfully!');
      } else {
        setError(response.data.message || 'Failed to delete invitation');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!window.confirm(`Are you sure you want to remove ${name} from your friends?`)) {
      return;
    }

    setInviting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Please login to remove friend");
        setInviting(false);
        return;
      }

      const response = await axiosInstance.delete('/api/friends/remove', {
        data: { friendId: id }
      });

      if (response.data.success) {
        setIsFriend(false);
        setSuccessMessage('Friend removed successfully!');
      } else {
        setError(response.data.message || 'Failed to remove friend');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setInviting(false);
    }
  };

  const viewProfile = () => navigate(`/user-profile/${id}`);

  const goToChat = (e) => {
    e.stopPropagation();
    navigate(`/chat/${id}`);
  };

  return (
    <div
      className="card-hover !rounded-xl cursor-pointer overflow-hidden animate-fade-in"
      onClick={viewProfile}
    >
      {/* User info header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <Avatar name={name} size="md" />

          {/* Name + profession */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-surface-900 truncate">{name}</h3>
            {profession && (
              <p className="text-xs text-surface-500 mt-0.5">{profession}</p>
            )}
            {bio && (
              <p className="text-xs text-surface-600 mt-1 line-clamp-2 italic">{bio}</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            {isFriend ? (
              <div className="flex gap-1.5">
                <button
                  onClick={goToChat}
                  className="btn-accent btn-xs"
                >
                  Chat
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFriend();
                  }}
                  disabled={inviting}
                  className="btn-ghost btn-xs !text-red-500 hover:!bg-red-50"
                >
                  {inviting ? '...' : 'Remove'}
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleInvite();
                }}
                disabled={inviting}
                className={`btn-xs ${
                  invited
                    ? 'btn-danger'
                    : 'btn-primary'
                }`}
              >
                {inviting
                  ? (invited ? 'Cancelling...' : 'Sending...')
                  : invited ? 'Cancel Invite' : 'Invite'
                }
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Travel details card */}
      {travelDetails && (travelDetails.trainNumber || travelDetails.preferredClass || travelDetails.boardingStation || travelDetails.destinationStation) && (
        <div className="px-4 pb-4">
          <div className="bg-primary-50/60 rounded-xl p-3 border border-primary-100">
            {/* Train header */}
            {(travelDetails.trainNumber || travelDetails.trainName) && (
              <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-primary-100">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                  <span className="text-primary-800 text-xs font-semibold">
                    {travelDetails.trainNumber && `${travelDetails.trainNumber}`}
                    {travelDetails.trainName && ` - ${travelDetails.trainName}`}
                  </span>
                </div>
                {travelDetails.preferredClass && (
                  <span className="badge-primary text-[10px]">
                    {travelDetails.preferredClass}
                  </span>
                )}
              </div>
            )}

            {/* Route */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-surface-800">
                  {travelDetails.boardingStationName || travelDetails.boardingStation}
                </p>
                {travelDetails.boardingStationName && travelDetails.boardingStation && (
                  <p className="text-[10px] text-surface-500">{travelDetails.boardingStation}</p>
                )}
              </div>

              <div className="flex items-center mx-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                <div className="w-8 h-px bg-primary-300" />
                <svg className="w-2.5 h-2.5 text-primary-400 -ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>

              <div className="flex-1 text-right">
                <p className="text-xs font-semibold text-surface-800">
                  {travelDetails.destinationStationName || travelDetails.destinationStation}
                </p>
                {travelDetails.destinationStationName && travelDetails.destinationStation && (
                  <p className="text-[10px] text-surface-500">{travelDetails.destinationStation}</p>
                )}
              </div>
            </div>

            {/* Travel date */}
            {travelDetails.travelDate && (
              <div className="mt-2 pt-2 border-t border-primary-100">
                <div className="flex items-center justify-center gap-1.5">
                  <svg className="w-3 h-3 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-[11px] text-primary-700 font-medium">
                    {new Date(travelDetails.travelDate).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status messages */}
      {(error || successMessage) && (
        <div className="px-4 pb-3">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
          {successMessage && (
            <div className="flex items-center gap-2 bg-accent-50 border border-accent-200 text-accent-700 text-xs px-3 py-2 rounded-lg">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {successMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Suggested;
