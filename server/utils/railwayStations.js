const fs = require("fs");
const path = require("path");

// Load railway stations data
let railwayStationsData = null;

const loadRailwayStations = () => {
  if (!railwayStationsData) {
    try {
      // Use an absolute path for production environments
      const filePath = process.env.NODE_ENV === 'production'
        ? path.join(process.cwd(), "backend/assets/railway_stations.json")
        : path.join(__dirname, "../assets/railway_stations.json");
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        // Try alternative paths for different deployment scenarios
        const alternativePaths = [
          path.join(process.cwd(), "assets/railway_stations.json"),
          path.join(__dirname, "../assets/railway_stations.json"),
          path.join(process.cwd(), "backend/assets/railway_stations.json")
        ];
        
        let foundPath = null;
        for (const altPath of alternativePaths) {
          if (fs.existsSync(altPath)) {
            foundPath = altPath;
            break;
          }
        }
        
        if (!foundPath) {
          throw new Error('Railway stations file not found in any expected location');
        }
        
        const data = fs.readFileSync(foundPath, "utf8");
        railwayStationsData = JSON.parse(data);
      } else {
        const data = fs.readFileSync(filePath, "utf8");
        railwayStationsData = JSON.parse(data);
      }
    } catch (error) {
      console.error("Error loading railway stations data:", error);
      railwayStationsData = { railway_stations_by_city: {} };
    }
  }
  return railwayStationsData;
};

// Helper function to find city by station code
const findCityByStationCode = (stationCode) => {
  const data = loadRailwayStations();
  const cities = data.railway_stations_by_city;
  
  for (const city in cities) {
    const stations = cities[city];
    const found = stations.find(station => 
      station.station_code.toLowerCase() === stationCode.toLowerCase()
    );
    if (found) {
      return city;
    }
  }
  return null;
};

// Helper function to get all station codes for a city
const getStationCodesForCity = (cityName) => {
  const data = loadRailwayStations();
  const cities = data.railway_stations_by_city;
  
  if (cities[cityName]) {
    return cities[cityName].map(station => station.station_code);
  }
  return [];
};

// Helper function to get all station codes for cities that match a station code
const getAllStationCodesForMatchingCities = (stationCode) => {
  const city = findCityByStationCode(stationCode);
  if (city) {
    return getStationCodesForCity(city);
  }
  return [stationCode]; // Return original if city not found
};

// Helper function to get station details by code
const getStationDetails = (stationCode) => {
  const data = loadRailwayStations();
  const cities = data.railway_stations_by_city;
  
  for (const city in cities) {
    const stations = cities[city];
    const found = stations.find(station => 
      station.station_code.toLowerCase() === stationCode.toLowerCase()
    );
    if (found) {
      return {
        ...found,
        city: city
      };
    }
  }
  return null;
};

// Helper function to search stations by name or code
const searchStations = (query, limit = 10) => {
  try {
    const data = loadRailwayStations();
    
    if (!data || !data.railway_stations_by_city) {
      console.error('Railway stations data is not properly loaded');
      return [];
    }
    
    const cities = data.railway_stations_by_city;
    const results = [];
    
    if (!query || query.trim() === '') {
      return results;
    }
    
    const queryLower = query.toLowerCase().trim();
    
    // First pass: exact matches (prioritize exact station code matches)
    for (const city in cities) {
      const stations = cities[city];
      if (!Array.isArray(stations)) continue;
      
      for (const station of stations) {
        if (!station || !station.station_name || !station.station_code) continue;
        
        const codeMatch = station.station_code.toLowerCase() === queryLower;
        if (codeMatch) {
          results.push({
            ...station,
            city: city,
            matchType: 'exact_code'
          });
        }
      }
    }
    
    // Second pass: starts with matches
    for (const city in cities) {
      const stations = cities[city];
      if (!Array.isArray(stations)) continue;
      
      for (const station of stations) {
        if (!station || !station.station_name || !station.station_code) continue;
        
        const nameStartsWith = station.station_name.toLowerCase().startsWith(queryLower);
        const codeStartsWith = station.station_code.toLowerCase().startsWith(queryLower);
        const cityStartsWith = city.toLowerCase().replace(/_/g, ' ').startsWith(queryLower);
        
        if ((nameStartsWith || codeStartsWith || cityStartsWith) && 
            !results.find(r => r.station_code === station.station_code)) {
          results.push({
            ...station,
            city: city,
            matchType: 'starts_with'
          });
          
          if (results.length >= limit) {
            return results;
          }
        }
      }
    }
    
    // Third pass: contains matches
    for (const city in cities) {
      const stations = cities[city];
      if (!Array.isArray(stations)) continue;
      
      for (const station of stations) {
        if (!station || !station.station_name || !station.station_code) continue;
        
        const nameMatch = station.station_name.toLowerCase().includes(queryLower);
        const codeMatch = station.station_code.toLowerCase().includes(queryLower);
        const cityMatch = city.toLowerCase().replace(/_/g, ' ').includes(queryLower);
        
        if ((nameMatch || codeMatch || cityMatch) && 
            !results.find(r => r.station_code === station.station_code)) {
          results.push({
            ...station,
            city: city,
            matchType: 'contains'
          });
          
          if (results.length >= limit) {
            return results;
          }
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error in searchStations:', error);
    return [];
  }
};

// Get all cities
const getAllCities = () => {
  const data = loadRailwayStations();
  return Object.keys(data.railway_stations_by_city);
};

module.exports = {
  loadRailwayStations,
  findCityByStationCode,
  getStationCodesForCity,
  getAllStationCodesForMatchingCities,
  getStationDetails,
  searchStations,
  getAllCities
};
