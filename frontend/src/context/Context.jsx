import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';

const TrainContext = createContext();

export const TrainProvider = ({ children }) => {
  const [toStation, setToStation] = useState('');
  const [fromStation, setFromStation] = useState('');
  const [toStationCode, setToStationCode] = useState('');
  const [fromStationCode, setFromStationCode] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [trains, setTrains] = useState([]);
  const [showTrainResults, setShowTrainResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchInitiated, setSearchInitiated] = useState(false);

  const sortTrainsByStationMatch = (trains, fromCode, toCode) => {
    if (!Array.isArray(trains)) return [];

    const trainsWithPriority = trains.map(train => {
      const fromMatch = train.fromStation?.code === fromCode;
      const toMatch = train.toStation?.code === toCode;
      
      let priority = 4;
      if (fromMatch && toMatch) priority = 1;
      else if (fromMatch) priority = 2;
      else if (toMatch) priority = 3;

      return { ...train, priority };
    });

    trainsWithPriority.sort((a, b) => a.priority - b.priority);
    return trainsWithPriority;
  };

  const searchTrains = async () => {
    if (!fromStationCode || !toStationCode || !selectedDate) {
      setError('Please select valid stations and date');
      return false;
    }
    
    setSearchInitiated(true);
    setLoading(true);
    setError(null);
    
    const formattedDate = selectedDate.split("-").reverse().join("-");
    
    try {
      const response = await axiosInstance.get(`/api/trains?from=${fromStationCode}&to=${toStationCode}&train_date=${formattedDate}`);
      const result = response.data;
      
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
      setLoading(false);
    }
  };

  return (
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
        showTrainResults,
        searchTrains,
        loading,
        error,
        setError,
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
