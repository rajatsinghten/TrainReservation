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
      return res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Already Paid</title>
            <style>
                body { margin: 0; padding: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: sans-serif; background: white; color: black;}
                .card { border: 4px solid black; padding: 40px; max-width: 320px; width: 100%; text-align: center;}
                h1 { font-size: 24px; font-weight: 900; text-transform: uppercase; margin: 0 0 10px; }
                p { font-size: 10px; font-weight: 900; text-transform: uppercase; opacity: 0.3; margin: 0 0 24px; letter-spacing: 2px; }
                .back { border: 2px solid black; padding: 12px; display: block; font-size: 10px; font-weight: 900; text-decoration: none; color: black; text-transform: uppercase; letter-spacing: 2px; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>ALREADY PAID</h1>
                <p>This reservation is confirmed.</p>
                <a href="/" class="back">CLOSE</a>
            </div>
        </body>
        </html>
      `);
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

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Successful</title>
          <style>
              body { 
                  margin: 0; padding: 20px; 
                  display: flex; flex-direction: column; align-items: center; justify-content: center; 
                  min-height: 100vh; font-family: sans-serif; background: white; color: black;
              }
              .card { 
                  border: 4px solid black; padding: 40px; max-width: 320px; width: 100%; text-align: center;
              }
              .icon { 
                  width: 48px; height: 48px; background: black; color: white; 
                  display: flex; align-items: center; justify-content: center; 
                  margin: 0 auto 24px; font-weight: bold; font-size: 24px;
              }
              h1 { font-size: 24px; font-weight: 900; text-transform: uppercase; margin: 0 0 10px; }
              p { font-size: 10px; font-weight: 900; text-transform: uppercase; opacity: 0.3; margin: 0 0 24px; letter-spacing: 2px; }
              .pnr { border: 2px solid black; padding: 12px; font-weight: 900; font-size: 14px; margin-bottom: 24px; }
              .back { border: 2px solid black; padding: 12px; display: block; font-size: 10px; font-weight: 900; text-decoration: none; color: black; text-transform: uppercase; letter-spacing: 2px; }
          </style>
      </head>
      <body>
          <div class="card">
              <div class="icon">✓</div>
              <h1>PAID</h1>
              <p>Reservation Confirmed</p>
              <div class="pnr">PNR: ${updatedBooking.pnr}</div>
              <a href="/" class="back">CLOSE</a>
          </div>
      </body>
      </html>
    `);
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
