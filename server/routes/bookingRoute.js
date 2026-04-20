const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createBooking,
  handleQrPayment,
  getMyBookings,
  cancelBooking,
} = require("../controllers/bookingController");

// Private routes
router.post("/", protect, createBooking);
router.get("/my-bookings", protect, getMyBookings);
router.delete("/active/:id", protect, cancelBooking);

// Public webhook for QR payment simulation (Scan result)
router.get("/pay/:token", handleQrPayment);

module.exports = router;
