import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { Spinner } from "../ui";

const BookingModal = ({ isOpen, onClose, booking }) => {
  const [paymentStatus, setPaymentStatus] = useState("PENDING");

  useEffect(() => {
    if (!isOpen || !booking) return;

    // Connect to socket to listen for payment confirmation
    // Connect to socket - Use environment variable or default to current origin
    const socket = io(import.meta.env.VITE_SOCKET_URL || window.location.origin);

    socket.emit("join", booking.userId);

    socket.on("paymentVerified", (data) => {
      if (data.pnr === booking.pnr) {
        setPaymentStatus("PAID");
        setTimeout(() => {
          onClose();
          window.location.href = "/dashboard";
        }, 3000);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [isOpen, booking, onClose]);

  if (!isOpen) return null;

  // QR code requires an absolute URL. Use env var or default to current origin.
  const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
  const paymentUrl = `${baseUrl}/api/bookings/pay/${booking.qrToken}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentUrl)}`;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto p-6 pt-24 bg-black/80 animate-minimal-in">
      <div className="bg-white border-4 border-black max-w-sm w-full p-8 space-y-8 my-auto">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black uppercase tracking-tighter">Secure Payment</h2>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Scan to finalize reservation</p>
        </div>
        
        <div className="relative mx-auto w-48 h-48 border-2 border-black p-2 bg-white flex items-center justify-center">
          {paymentStatus === "PAID" ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-black flex items-center justify-center">
                 <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                 </svg>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">SUCCESS</span>
            </div>
          ) : (
            <img src={qrCodeUrl} alt="QR" className="w-full h-full grayscale" />
          )}
        </div>

        <div className="space-y-4">
          <div className="flex justify-between border-b-2 border-black/5 pb-2">
            <span className="text-[9px] font-black uppercase tracking-widest opacity-30">PNR</span>
            <span className="text-[10px] font-black">{booking.pnr}</span>
          </div>
          
          {paymentStatus === "PENDING" && (
            <div className="flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em]">
              <Spinner size="sm" />
              <span>WAITING...</span>
            </div>
          )}

          <button 
            onClick={onClose} 
            className="w-full py-4 border-2 border-black text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
          >
            CANCEL
          </button>
          
          <div className="text-center">
            <a href={paymentUrl} target="_blank" rel="noreferrer" className="text-[8px] font-black uppercase tracking-widest opacity-20 hover:opacity-100 underline decoration-2">
              [ MANUAL SIMULATION ]
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
