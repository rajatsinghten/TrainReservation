const axios = require('axios');

const findTrains = async (req, res) => {
  const { from, to, train_date } = req.query;

  
  if (!from || !to || !train_date) {
    return res.status(400).json({
      status: false,
      message: "Missing required parameters: from, to, train_date",
    });
  }

  try {
    // Make API call to the train search endpoint
    const apiUrl = `https://cttrainsapi.confirmtkt.com/api/v1/trains/search?sourceStationCode=${from}&destinationStationCode=${to}&dateOfJourney=${train_date}`;
    
    const response = await axios.get(apiUrl);
      // Extract useful train data from the API response
    const trainList = response.data?.data?.trainList || [];
      // Map the API response to a simplified format with only useful data
    const formattedTrains = trainList.map(train => {
      // Get availability and prediction info for all classes
      const classesInfo = [];
      if (train.avlClassesSorted && train.availabilityCache) {
        train.avlClassesSorted.forEach(classCode => {
          const classData = train.availabilityCache[classCode];
          if (classData) {
            classesInfo.push({
              class: classCode,
              fare: classData.fare,
              availability: classData.availabilityDisplayName,
              prediction: classData.predictionDisplayName,
              predictionPercentage: classData.predictionPercentage,
              availabilityCount: classData.availabilityCount,
              predictionCount: classData.predictionCount
            });
          }
        });
      }
      
      return {
        trainNumber: train.trainNumber,
        trainName: train.trainName,
        trainType: train.trainType,
        departureTime: train.departureTime,
        arrivalTime: train.arrivalTime,
        duration: train.duration,
        distance: train.distance,
        train_date: train_date, // Include the original train_date from request
        fromStation: {
          code: train.fromStnCode,
          name: train.fromStnName,
          city: train.fromCityName
        },
        toStation: {
          code: train.toStnCode,
          name: train.toStnName,
          city: train.toCityName
        },
        availableClasses: train.avlClassesSorted || [],
        hasPantry: train.hasPantry,
        trainRating: train.trainRating,        runningDays: train.runningDays,
        // Include fare and availability info for all available classes
        classesInfo: classesInfo
      };    });

    // Build the response object
    const responseData = {
      status: true,
      message: "Success",
      timestamp: Date.now(),
      data: formattedTrains,
    };
    
    res.json(responseData);
  } catch (error) {
    console.error('Error fetching train data:', error.message);
    console.error('Error details:', error.response?.data || error.message);
    
    // Return error response when API fails
    return res.status(500).json({
      status: false,
      message: "Unable to fetch train data. Please try again later.",
      error: error.message
    });
  }
};

module.exports = { findTrains };
