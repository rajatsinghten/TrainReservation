const {
  searchStations,
  getAllCities: getCitiesList,
  getStationDetails,
  findCityByStationCode,
  getAllStationCodesForMatchingCities,
  getStationCodesForCity
} = require('../utils/railwayStations');

// Get station suggestions based on search query
const getStationSuggestions = async (req, res) => {
  const { city, q } = req.query;
  const query = city || q; // Support both 'city' and 'q' parameters for backwards compatibility

  if (!query) {
    return res.status(400).json({
      status: false,
      message: "Search query parameter is required (use 'city' or 'q')",
    });
  }

  try {
    const suggestions = searchStations(query, 15);
    
    if (suggestions.length === 0) {
      return res.json({
        status: true,
        message: "No stations found for the search query",
        data: {
          searchTerm: query,
          suggestions: [],
          totalFound: 0
        }
      });
    }
    
    // Group by city for better organization
    const groupedSuggestions = {};
    suggestions.forEach(station => {
      if (!groupedSuggestions[station.city]) {
        groupedSuggestions[station.city] = {
          city: station.city.replace(/_/g, ' '),
          originalCityKey: station.city,
          stations: []
        };
      }
      groupedSuggestions[station.city].stations.push({
        stationName: station.station_name,
        stationCode: station.station_code,
        displayText: `${station.station_name} - ${station.station_code}`
      });
    });

    const result = Object.values(groupedSuggestions);

    res.json({
      status: true,
      message: "Station suggestions fetched successfully",
      data: {
        searchTerm: query,
        suggestions: result,
        totalFound: suggestions.length
      }
    });
  } catch (error) {
    console.error('Error getting station suggestions:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all stations for a specific city
const getStationsByCity = async (req, res) => {
  const { cityKey } = req.params;

  if (!cityKey) {
    return res.status(400).json({
      status: false,
      message: "City key parameter is required",
    });
  }

  try {
    const cityKeyUpper = cityKey.toUpperCase().replace(/\s+/g, '_');
    const stationCodes = getStationCodesForCity(cityKeyUpper);

    if (!stationCodes || stationCodes.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No stations found for the specified city",
      });
    }

    // Get detailed information for each station
    const stations = stationCodes.map(code => {
      const details = getStationDetails(code);
      return {
        stationName: details.station_name,
        stationCode: details.station_code
      };
    }).filter(station => station.stationName); // Filter out any null results

    res.json({
      status: true,
      message: "Success",
      data: {
        city: cityKeyUpper.replace(/_/g, ' '),
        stations: stations
      }
    });

  } catch (error) {
    console.error('Error getting stations by city:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error while fetching stations",
      error: error.message
    });
  }
};

// Get all available cities
const getAllCities = async (req, res) => {
  try {
    const cities = getCitiesList().map(cityKey => ({
      cityKey: cityKey,
      cityName: cityKey.replace(/_/g, ' '),
      stationCount: getStationCodesForCity(cityKey).length
    }));

    // Sort cities alphabetically
    cities.sort((a, b) => a.cityName.localeCompare(b.cityName));

    res.json({
      status: true,
      message: "Success",
      data: {
        cities: cities,
        totalCities: cities.length
      }
    });

  } catch (error) {
    console.error('Error getting all cities:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error while fetching cities",
      error: error.message
    });
  }
};

// Get station details by code
const getStationByCode = async (req, res) => {
  const { stationCode } = req.params;

  if (!stationCode) {
    return res.status(400).json({
      status: false,
      message: "Station code parameter is required",
    });
  }

  try {
    const stationDetails = getStationDetails(stationCode);

    if (!stationDetails) {
      return res.status(404).json({
        status: false,
        message: "Station not found",
      });
    }

    res.json({
      status: true,
      message: "Success",
      data: {
        station: stationDetails,
        cityStations: getAllStationCodesForMatchingCities(stationCode)
      }
    });

  } catch (error) {
    console.error('Error getting station by code:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error while fetching station details",
      error: error.message
    });
  }
};

// Get city information by station code
const getCityByStation = async (req, res) => {
  const { stationCode } = req.params;

  if (!stationCode) {
    return res.status(400).json({
      status: false,
      message: "Station code parameter is required",
    });
  }

  try {
    const city = findCityByStationCode(stationCode);

    if (!city) {
      return res.status(404).json({
        status: false,
        message: "City not found for the given station code",
      });
    }

    const allStationsInCity = getAllStationCodesForMatchingCities(stationCode);

    res.json({
      status: true,
      message: "Success",
      data: {
        city: city.replace(/_/g, ' '),
        cityKey: city,
        stationCode: stationCode,
        allStationsInCity: allStationsInCity
      }
    });

  } catch (error) {
    console.error('Error getting city by station:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error while fetching city information",
      error: error.message
    });
  }
};

// Health check endpoint to verify railway stations data is loaded
const getStationDataHealth = async (req, res) => {
  try {
    const { loadRailwayStations } = require('../utils/railwayStations');
    const data = loadRailwayStations();
    
    const cities = Object.keys(data.railway_stations_by_city || {});
    const totalStations = cities.reduce((sum, city) => {
      return sum + (data.railway_stations_by_city[city]?.length || 0);
    }, 0);
    
    res.json({
      status: true,
      message: "Railway stations data health check",
      data: {
        isDataLoaded: !!data && !!data.railway_stations_by_city,
        totalCities: cities.length,
        totalStations: totalStations,
        sampleCities: cities.slice(0, 5),
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error in health check:', error);
    res.status(500).json({
      status: false,
      message: "Health check failed",
      error: error.message
    });
  }
};

module.exports = {
  getStationSuggestions,
  getStationsByCity,
  getAllCities,
  getStationByCode,
  getCityByStation,
  getStationDataHealth
};
