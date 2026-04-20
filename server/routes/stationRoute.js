const express = require("express");
const router = express.Router();
const { 
  getStationSuggestions, 
  getStationsByCity, 
  getAllCities,
  getStationByCode,
  getCityByStation,
  getStationDataHealth
} = require("../controllers/stationController");

// Health check endpoint for railway stations data
// GET /api/stations/health
router.get('/health', getStationDataHealth);

// Get station suggestions based on search query
// GET /api/stations/suggestions?city=delhi or /api/stations/suggestions?q=delhi
router.get('/suggestions', getStationSuggestions);

// Get all stations for a specific city
// GET /api/stations/city/DELHI
router.get('/city/:cityKey', getStationsByCity);

// Get all available cities
// GET /api/stations/cities
router.get('/cities', getAllCities);

// Get station details by code
// GET /api/stations/station/NDLS
router.get('/station/:stationCode', getStationByCode);

// Get city information by station code
// GET /api/stations/city-by-station/NDLS
router.get('/city-by-station/:stationCode', getCityByStation);

module.exports = router;
