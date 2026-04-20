import React, { useState } from "react";
import axiosInstance from "../../utils/axios";
import ClassInfo from "./ClassInfo";
import { Spinner } from "../ui";
import BookingModal from "./BookingModal";

const TrainCard = ({ train }) => {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedFare, setSelectedFare] = useState(0);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [bookingData, setBookingData] = useState(null);

  const handleClassSelect = (classType) => {
    setSelectedClass(classType);
    // Find fare for the selected class
    const classInfo = train.classesInfo?.find(c => c.class === classType);
    if (classInfo) {
      setSelectedFare(classInfo.fare);
    }
  };

  const handleBookTicket = async () => {
    if (!selectedClass) {
      setBookingError("Please select a travel class");
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
      console.error("Booking error:", error);
      setBookingError(error.response?.data?.message || "Failed to initiate booking");
    } finally {
      setIsBooking(false);
    }
  };

  const durationText = train.duration
    ? `${Math.floor(train.duration / 60)}h ${train.duration % 60}m`
    : null;

  return (
    <li className="bg-white w-full rounded-xl border border-surface-200 shadow-sm hover:shadow-md hover:border-surface-300 transition-all duration-200 overflow-hidden animate-fade-in">
      <div className="px-3.5 py-2.5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h3 className="text-sm font-bold text-surface-900 truncate leading-tight">{train.trainName}</h3>
            <span className="text-[10px] font-mono text-surface-400 flex-shrink-0">#{train.trainNumber}</span>
          </div>
          {train.train_date && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 border border-primary-100 rounded-md text-[10px] font-semibold text-primary-700 flex-shrink-0">
              {train.train_date}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 bg-surface-50 rounded-lg px-3 py-2 mb-2">
          <div className="flex-1 min-w-0">
            <span className="text-sm font-bold text-surface-900 tabular-nums">{train.departureTime || '—'}</span>
            <span className="text-[10px] text-surface-500 ml-1.5 font-mono uppercase">{train.fromStation?.code}</span>
            <p className="text-[10px] text-surface-500 truncate leading-tight mt-0.5">{train.fromStation?.name}</p>
          </div>

          <div className="flex flex-col items-center gap-0.5 flex-shrink-0 px-2">
            {durationText && <span className="text-[9px] font-semibold text-surface-400">{durationText}</span>}
            <div className="flex items-center gap-0.5">
              <div className="w-1 h-1 rounded-full bg-primary-400" />
              <div className="w-10 md:w-16 h-px bg-gradient-to-r from-primary-300 via-primary-400 to-primary-300" />
              <div className="w-0 h-0 border-y-[3px] border-y-transparent border-l-[5px] border-l-primary-500" />
            </div>
          </div>

          <div className="flex-1 min-w-0 text-right">
            <span className="text-sm font-bold text-surface-900 tabular-nums">{train.arrivalTime || '—'}</span>
            <span className="text-[10px] text-surface-500 ml-1.5 font-mono uppercase">{train.toStation?.code}</span>
            <p className="text-[10px] text-surface-500 truncate leading-tight mt-0.5">{train.toStation?.name}</p>
          </div>
        </div>

        <div className="border-t border-surface-100 pt-2 mb-2">
          <ClassInfo
            train={train}
            selectedClass={selectedClass}
            onClassSelect={handleClassSelect}
          />
        </div>

        <button 
          onClick={handleBookTicket} 
          disabled={isBooking || !selectedClass} 
          className="btn-primary btn-sm w-full"
        >
          {isBooking ? <Spinner size="sm" /> : "Book Ticket"}
        </button>

        {bookingError && (
          <p className="mt-1 text-[10px] text-red-500 text-center">{bookingError}</p>
        )}
      </div>

      {showModal && (
        <BookingModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
          booking={bookingData} 
        />
      )}
    </li>
  );
};

export default TrainCard;