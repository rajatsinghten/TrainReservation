import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance, { isAuthenticated } from '../utils/axios';
import { formatDate } from '../utils/formatters';
import { Navbar } from '../components/layout';
import { PageLoading, PageError } from '../components/ui';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userRes, bookingsRes] = await Promise.all([
          axiosInstance.get('/api/users/me'),
          axiosInstance.get('/api/bookings/my-bookings')
        ]);
        
        if (userRes.data.success) {
          setUserData(userRes.data.user);
        }
        if (bookingsRes.data.success) {
          setBookings(bookingsRes.data.bookings);
        }
      } catch (error) {
        setError('Failed to fetch dashboard data.');
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleCancelBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      const res = await axiosInstance.delete(`/api/bookings/active/${id}`);
      if (res.data.success) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b));
      }
    } catch (err) {
      alert("Failed to cancel booking");
    }
  };
  
  if (loading) return <PageLoading message="Loading your bookings..." />;
  if (error) return <PageError message={error} />;

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <div className="max-w-4xl mx-auto py-8 px-4 pt-24 animate-fade-in">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-surface-900 font-display">My Bookings</h1>
            <p className="text-sm text-surface-500 mt-1">Manage your train reservations and tickets</p>
          </div>
          <button onClick={() => navigate('/')} className="btn-primary btn-sm">New Booking</button>
        </div>

        <div className="space-y-4">
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <div key={booking.id} className="card p-5 border-l-4 overflow-hidden relative" style={{ 
                borderLeftColor: booking.status === 'PAID' ? '#10b981' : 
                                booking.status === 'PENDING' ? '#f59e0b' : '#ef4444' 
              }}>
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                       <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                         booking.status === 'PAID' ? 'bg-accent-100 text-accent-700' : 
                         booking.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                       }`}>
                         {booking.status}
                       </span>
                       <span className="text-xs font-mono text-surface-400">PNR: {booking.pnr}</span>
                    </div>
                    <h3 className="text-lg font-bold text-surface-900">{booking.trainName}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-surface-600">
                       <div className="flex flex-col">
                         <span className="text-[10px] uppercase font-bold text-surface-400">From</span>
                         <span className="font-semibold">{booking.boardingStation}</span>
                       </div>
                       <div className="w-8 h-px bg-surface-200 mt-3" />
                       <div className="flex flex-col">
                         <span className="text-[10px] uppercase font-bold text-surface-400">To</span>
                         <span className="font-semibold">{booking.destinationStation}</span>
                       </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col justify-between items-end gap-2 border-t md:border-t-0 md:border-l border-surface-100 pt-4 md:pt-0 md:pl-6">
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-surface-400">Travel Date</p>
                      <p className="text-sm font-bold text-surface-900">{formatDate(booking.travelDate)}</p>
                      <p className="text-xs text-surface-500 font-medium mt-1">{booking.class} · ₹{booking.fare}</p>
                    </div>
                    {booking.status !== 'CANCELLED' && (
                      <button 
                        onClick={() => handleCancelBooking(booking.id)}
                        className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="card p-12 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-surface-900">No Bookings Yet</h3>
                <p className="text-sm text-surface-500 mt-1">Your confirmed tickets will appear here.</p>
              </div>
              <button onClick={() => navigate('/')} className="btn-primary mt-2">Find a Train</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;