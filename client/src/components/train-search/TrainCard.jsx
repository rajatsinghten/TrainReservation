import React, { useState } from "react";
import axiosInstance from "../../utils/axios";
import { Spinner } from "../ui";
import BookingModal from "./BookingModal";
import AuthModal from "./AuthModal";
import { isAuthenticated } from "../../utils/axios";

const TrainCard = ({ train }) => {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedFare, setSelectedFare] = useState(0);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [bookingData, setBookingData] = useState(null);

  const handleClassSelect = (classInfo) => {
    setSelectedClass(classInfo.class);
    setSelectedFare(classInfo.fare);
  };

  const handleBookTicket = async () => {
    if (!selectedClass) return;
    
    if (!isAuthenticated()) {
      setShowAuthModal(true);
      return;
    }

    setIsBooking(true);
    setBookingError(null);

    try {
      const response = await axiosInstance.post("/api/bookings", {
        trainNumber: train.trainNumber,
        trainName: train.trainName,
        travelDate: train.train_date,
        boardingStation: train.fromStation?.name || train.from,
        destinationStation: train.toStation?.name || train.to,
        travelClass: selectedClass,
        fare: selectedFare,
      });

      if (response.data.success) {
        setBookingData(response.data.booking);
        setShowModal(true);
      }
    } catch (error) {
      setBookingError(error.response?.data?.message || "Error");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="group border-b-2 border-black/5 hover:border-black transition-colors py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        {/* Train Info */}
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-black opacity-30 tracking-widest">{train.trainNumber}</span>
             <h3 className="text-xl font-black uppercase tracking-tight">{train.trainName}</h3>
          </div>
          <div className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-black/50">
            <div>{train.departureTime} → {train.arrivalTime}</div>
            <div>{Math.floor(train.duration/60)}H {train.duration%60}M</div>
          </div>
        </div>

        {/* Classes */}
        <div className="flex flex-wrap gap-2">
          {train.classesInfo?.map(c => (
            <button
              key={c.class}
              onClick={() => handleClassSelect(c)}
              className={`px-3 py-1.5 text-[10px] font-black border-2 transition-all ${
                selectedClass === c.class ? 'bg-black text-white border-black' : 'border-black/10 hover:border-black'
              }`}
            >
              {c.class} • ₹{c.fare}
            </button>
          ))}
        </div>

        {/* Action */}
        <div className="min-w-[120px]">
          <button
            onClick={handleBookTicket}
            disabled={!selectedClass || isBooking}
            className="btn btn-primary w-full py-3 !border-2"
          >
            {isBooking ? <Spinner size="sm" /> : "BOOK"}
          </button>
          {bookingError && <p className="text-[8px] text-red-600 font-bold mt-1 uppercase">{bookingError}</p>}
        </div>
      </div>

      {showModal && (
        <BookingModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
          booking={bookingData} 
        />
      )}

      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      )}
    </div>
  );
};

export default TrainCard;