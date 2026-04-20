const express = require("express");
const router = express.Router();
const { findTrains } = require("../controllers/findTrains");

// GET /api/trains/trains -> should probably just be /
router.get('/', findTrains);

module.exports = router;