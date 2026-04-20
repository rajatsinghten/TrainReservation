import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { useTrainContext } from "../../context/Context";
import { Spinner } from "../ui";

const BookingModal = ({ isOpen, onClose, booking }) => {
  const [paymentStatus, setPaymentStatus] = useState("PENDING");
  const { user } = useTrainContext();

  useEffect(() => {
    if (!isOpen || !booking) return;

    // Connect to socket to listen for payment confirmation
    const socket = io(window.location.origin.replace("5173", "4000")); // Adjust Port for dev

    socket.emit("join", user?.id || booking.userId);

    socket.on("paymentVerified", (data) => {
      if (data.pnr === booking.pnr) {
        setPaymentStatus("PAID");
        // Close modal after success
        setTimeout(() => {
          onClose();
          window.location.href = "/dashboard";
        }, 3000);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [isOpen, booking, user, onClose]);

  if (!isOpen) return null;

  // Generate QR Code URL (using a free QR API)
  // The URL encoded in QR will hit our endpoint: /api/bookings/pay/:token
  const baseUrl = window.location.origin.replace("5173", "4000");
  const paymentUrl = `${baseUrl}/api/bookings/pay/${booking.qrToken}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden transform transition-all">
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold text-surface-900 mb-2">Complete Payment</h2>
          <p className="text-sm text-surface-500 mb-6">Scan this QR code with your phone to simulate payment</p>
          
          <div className="relative mx-auto w-48 h-48 bg-surface-50 rounded-xl flex items-center justify-center border-2 border-dashed border-surface-200 mb-6">
            {paymentStatus === "PAID" ? (
              <div className="flex flex-col items-center animate-bounce">
                <div className="w-16 h-16 bg-accent-500 rounded-full flex items-center justify-center mb-2">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-accent-700 font-bold">Payment Done!</span>
              </div>
            ) : (
              <img src={qrCodeUrl} alt="Payment QR Code" className="w-40 h-40" />
            )}
          </div>

          <div className="bg-surface-50 rounded-lg p-3 mb-6 text-left">
            <div className="flex justify-between text-[10px] uppercase font-bold text-surface-400 mb-1">
              <span>PNR Number</span>
              <span>Train</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-surface-900">
              <span>{booking.pnr}</span>
              <span className="truncate ml-2">Ticket Confirmation</span>
            </div>
          </div>

          {paymentStatus === "PENDING" && (
            <div className="flex items-center justify-center gap-2 text-primary-600 text-sm font-medium mb-6">
              <Spinner size="sm" />
              Waiting for payment...
            </div>
          )}

          <button 
            onClick={onClose} 
            className="w-full py-2.5 px-4 bg-surface-100 hover:bg-surface-200 text-surface-700 font-bold rounded-xl transition-colors"
          >
            Cancel
          </button>
          
          <div className="mt-4 text-[10px] text-surface-400">
            Internal Test: <a href={paymentUrl} target="_blank" rel="noreferrer" className="underline">Simulate Scan</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
