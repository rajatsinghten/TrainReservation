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
        setError('Failed to fetch data.');
        console.error('Dashboard error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleCancelBooking = async (id) => {
    if (!window.confirm("CONFIRM CANCELLATION?")) return;
    try {
      const res = await axiosInstance.delete(`/api/bookings/active/${id}`);
      if (res.data.success) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b));
      }
    } catch (err) {
      alert("ERROR");
    }
  };
  
  if (loading) return <PageLoading />;
  if (error) return <PageError message={error} />;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-20 animate-minimal-in">
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between border-b-4 border-black pb-4 gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">Reservations</h1>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-30">User: {userData?.username}</p>
          </div>
          <button onClick={() => navigate('/')} className="btn btn-primary px-8">NEW BOOKING</button>
        </div>

        <div className="space-y-0">
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <div key={booking.id} className="py-8 border-b-2 border-black/5 hover:border-black transition-colors flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-0.5 border-2 border-black text-[9px] font-black uppercase tracking-widest ${
                      booking.status === 'PAID' ? 'bg-black text-white' : ''
                    }`}>
                      {booking.status}
                    </span>
                    <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">PNR: {booking.pnr}</span>
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-xl font-black uppercase tracking-tight leading-none">{booking.trainName}</h3>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-black/50">
                      {booking.boardingStation} → {booking.destinationStation}
                    </div>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col justify-between items-end gap-2 text-right">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Travel Date</p>
                    <p className="text-sm font-black uppercase tracking-tight">{formatDate(booking.travelDate)}</p>
                    <p className="text-[10px] font-bold text-black/50 mt-1 uppercase tracking-widest">{booking.class} · ₹{booking.fare}</p>
                  </div>
                  {booking.status !== 'CANCELLED' && (
                    <button 
                      onClick={() => handleCancelBooking(booking.id)}
                      className="text-[9px] font-black uppercase tracking-widest text-red-600 hover:underline"
                    >
                      CANCEL
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center space-y-4">
               <p className="text-[10px] font-bold uppercase tracking-widest opacity-30">No active reservations</p>
               <button onClick={() => navigate('/')} className="btn border-2 border-black">FIND TRAINS</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;