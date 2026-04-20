import React from 'react';
import TrainList from './TrainList';
import { useTrainContext } from '../../context/Context';

const TrainSearchContainer = () => {
  const { trains, showTrainResults, activeView, suggestions } = useTrainContext();

  const hasResults = showTrainResults && trains && trains.length > 0;

  return (
    <div 
      className={`w-full ${
        hasResults && activeView !== 'trains' ? 'hidden lg:block' : 'block'
      }`}
    >
      <TrainList />
    </div>
  );
};

export default TrainSearchContainer;
