const prisma = require("../config/prisma");
const crypto = require("crypto");

// Create a new booking (Reservation)
const createBooking = async (req, res) => {
  try {
    const {
      trainNumber,
      trainName,
      travelDate,
      boardingStation,
      destinationStation,
      travelClass,
      fare,
    } = req.body;

    if (!trainNumber || !boardingStation || !destinationStation || !travelDate || !travelClass) {
      return res.status(400).json({
        success: false,
        message: "Missing reservation details",
      });
    }

    // Generate a unique PNR (10 digits)
    const pnr = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    
    // Generate a special number for QR payment
    const qrToken = crypto.randomBytes(16).toString("hex");

    const parseDate = (dateStr) => {
      if (!dateStr) return new Date();
      // If already ISO format YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return new Date(dateStr);
      // Handle DD-MM-YYYY
      const parts = dateStr.split("-");
      if (parts.length === 3 && parts[0].length === 2 && parts[2].length === 4) {
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }
      return new Date(dateStr);
    };

    const booking = await prisma.reservation.create({
      data: {
        pnr,
        trainNumber,
        trainName: trainName || "Unknown Train",
        travelDate: parseDate(travelDate),
        boardingStation,
        destinationStation,
        class: travelClass,
        fare: parseFloat(fare) || 0,
        status: "PENDING",
        qrToken,
        userId: req.user.id,
      },
    });

    res.status(201).json({
      success: true,
      message: "Booking initiated. Please complete payment.",
      booking: {
        id: booking.id,
        pnr: booking.pnr,
        qrToken: booking.qrToken,
        status: booking.status,
      },
    });
  } catch (error) {
    console.error("Error in createBooking:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Webhook for QR Payment (The "special number" hit)
const handleQrPayment = async (req, res) => {
  try {
    const { token } = req.params;

    const booking = await prisma.reservation.findUnique({
      where: { qrToken: token },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Invalid payment token",
      });
    }

    if (booking.status === "PAID") {
      return res.status(200).json({
        success: true,
        message: "Payment already processed",
      });
    }

    const updatedBooking = await prisma.reservation.update({
      where: { id: booking.id },
      data: { status: "PAID" },
    });

    // Notify the frontend via socket if available
    // Note: We'll handle socket emission in index.js by passing io or using a global emitter
    if (global.io) {
      global.io.emit("paymentVerified", {
        bookingId: updatedBooking.id,
        pnr: updatedBooking.pnr,
        status: "PAID",
      });
    }

    res.json({
      success: true,
      message: "Payment successful! Your ticket is confirmed.",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Error in handleQrPayment:", error);
    res.status(500).json({
      success: false,
      message: "Server error during payment",
    });
  }
};

// Get user's bookings
const getMyBookings = async (req, res) => {
  try {
    const bookings = await prisma.reservation.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("Error in getMyBookings:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Cancel a booking
const cancelBooking = async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);

    const booking = await prisma.reservation.findUnique({
      where: { id: bookingId },
    });

    if (!booking || booking.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    await prisma.reservation.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });

    res.json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("Error in cancelBooking:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createBooking,
  handleQrPayment,
  getMyBookings,
  cancelBooking,
};
