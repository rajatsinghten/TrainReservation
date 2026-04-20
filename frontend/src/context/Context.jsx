import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';

const TrainContext = createContext();

export const TrainProvider = ({ children }) => {
  const [toStation, setToStation] = useState('');
  const [fromStation, setFromStation] = useState('');
  const [toStationCode, setToStationCode] = useState('');
  const [fromStationCode, setFromStationCode] = useState('');
  const [selectedDate, setSelectedDate] = useState('');  const [trains, setTrains] = useState([]);
  const [list, setList] = useState(false);
  const [showTrainResults, setShowTrainResults] = useState(false); // Separate state for train results
  const [suggestions, setSuggestions] = useState(false);
  const [buddies, setBuddies] = useState([]);  const [trainLoading, setTrainLoading] = useState(false);
  const [buddyLoading, setBuddyLoading] = useState(false);
  const loading = trainLoading || buddyLoading;
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('trains'); // 'trains' or 'buddies'
  const [searchInitiated, setSearchInitiated] = useState(false); // Track if any search has been initiated

  // Toggle between trains and buddies view for mobile
  const toggleView = (view) => {
    if (view === 'trains') {
      setActiveView('trains');
    } else if (view === 'buddies') {
      setActiveView('buddies');
    } else {
      // Toggle if no specific view provided
      setActiveView(prev => prev === 'trains' ? 'buddies' : 'trains');
    }
  };  // Automatically switch views when only one result type is available
  useEffect(() => {
    if (showTrainResults && !suggestions) {
      setActiveView('trains');
    } else if (suggestions && !showTrainResults) {
      setActiveView('buddies');
    }
    // When both are available, preserve the user's explicit view choice
  }, [showTrainResults, suggestions]);// Function to sort trains by exact station code matches with priority levels
  
  const sortTrainsByStationMatch = (trains, fromCode, toCode) => {
  if (!Array.isArray(trains)) return [];

  console.log('Sorting trains by station match:', { fromCode, toCode });

  // Preprocess trains with priority
  const trainsWithPriority = trains.map(train => {
    const fromMatch = train.fromStation?.code === fromCode;
    const toMatch = train.toStation?.code === toCode;
    
    let priority = 4;
    if (fromMatch && toMatch) priority = 1;
    else if (fromMatch) priority = 2;
    else if (toMatch) priority = 3;

    return { ...train, priority };
  });

  // Sort by priority
  trainsWithPriority.sort((a, b) => a.priority - b.priority);

  // Group by priority for logging
  const grouped = [1, 2, 3, 4].reduce((acc, p) => {
    acc[p] = trainsWithPriority
      .filter(t => t.priority === p)
      .map(t => ({
        number: t.trainNumber,
        name: t.trainName,
        from: t.fromStation?.code,
        to: t.toStation?.code
      }));
    return acc;
  }, {});

  // Log grouped summary
  [1, 2, 3, 4].forEach(p => {
    if (grouped[p].length > 0) {
      console.log(`Priority ${p} (${[
        '',
        'Both stations match',
        'Only departure matches',
        'Only destination matches',
        'No matches'
      ][p]}): ${grouped[p].length} trains`);
      console.log(grouped[p]);
    }
  });

  return trainsWithPriority;
};
  const searchTrains = async () => {
    if (!fromStationCode || !toStationCode || !selectedDate) {
      setError('Please select valid stations and date');
      return false;
    }
    
    setSearchInitiated(true);
    setTrainLoading(true);
    setError(null);
    
    const formattedDate = selectedDate.split("-").reverse().join("-");
    
    try {
      const response = await axiosInstance.get(`/api/trains?from=${fromStationCode}&to=${toStationCode}&train_date=${formattedDate}`);
      const result = response.data;
      console.log(result);
      if (result.status) {
        const sortedTrains = sortTrainsByStationMatch(result.data, fromStationCode, toStationCode);
        setTrains(sortedTrains);
        setShowTrainResults(true);
        return true;
      } else {
        setError(result.message || 'Failed to fetch trains');
        setTrains([]);
        setShowTrainResults(false);
        return false;
      }
    } catch (error) {
      console.error("Error fetching trains:", error);
      setError('Failed to fetch trains. Please try again.');
      setTrains([]);
      setShowTrainResults(false);
      return false;
    } finally {
      setTrainLoading(false);
    }
  };
  const findBuddies = async () => {
    if (!fromStationCode || !toStationCode || !selectedDate) {
      setError('Please select valid stations and date');
      return false;
    }

    setSearchInitiated(true);
    setBuddyLoading(true);
    setError(null);

    try {
      const formattedDate = selectedDate;
      
      console.log("Finding buddies with params:", {
        from: fromStationCode,
        to: toStationCode,
        date: formattedDate,
        originalDate: selectedDate
      });
      
      console.log("Date objects:", {
        originalDate: new Date(selectedDate),
        formattedDate: new Date(formattedDate),
        isValidDate: !isNaN(new Date(formattedDate).getTime())
      });
      
      const response = await axiosInstance.get('/api/users/travel-buddies', {
        params: {
          from: fromStationCode,
          to: toStationCode,
          date: formattedDate
        }
      });

      console.log("Buddies response:", response.data);

      if (response.data.success) {
        if (response.data.data && Array.isArray(response.data.data)) {
          const currentUserId = localStorage.getItem('userId');
          const filteredBuddies = response.data.data.filter(buddy => buddy._id !== currentUserId);
          setBuddies(filteredBuddies);
          console.log("Setting buddies (filtered):", filteredBuddies);
        } else {
          setBuddies([]);
          console.log("No buddies data in response or invalid format");
        }
        setSuggestions(true);
        return true;
      } else {
        setError(response.data.message || 'Failed to find travel buddies');
        return false;
      }
    } catch (error) {
      console.error('Error finding travel buddies:', error);
      setError(
        error.response?.data?.message || 
        'An error occurred. Please try again.'
      );
      setBuddies([]);
      return false;
    } finally {
      setBuddyLoading(false);
    }
  };return (
    <TrainContext.Provider
      value={{
        toStation,
        setToStation,
        fromStation,
        setFromStation,
        toStationCode,
        setToStationCode,
        fromStationCode,
        setFromStationCode,
        selectedDate,
        setSelectedDate,
        trains,
        setTrains,
        list,
        setList,
        showTrainResults,
        setShowTrainResults,
        suggestions,
        setSuggestions,
        searchTrains,
        buddies,
        setBuddies,
        findBuddies,        loading,
        trainLoading,
        buddyLoading,
        error,
        setError,
        activeView,
        toggleView,
        searchInitiated,
        setSearchInitiated
      }}
    >
      {children}
    </TrainContext.Provider>
  );
};

export const useTrainContext = () => {
  const context = useContext(TrainContext);
  if (!context) {
    throw new Error('useTrainContext must be used within a TrainProvider');
  }
  return context;
};
