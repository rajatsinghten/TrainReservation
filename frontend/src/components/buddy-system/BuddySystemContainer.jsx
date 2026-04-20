import React from 'react';
import Suggestions from './Suggestions';
import { useTrainContext } from '../../context/Context';

const BuddySystemContainer = () => {
  const { suggestions, setSuggestions, activeView, showTrainResults, trains } = useTrainContext();

  if (!suggestions) {
    return null;
  }

  // Check if both train and buddy results are visible
  const hasTrainResults = showTrainResults && trains && trains.length > 0;
  const onlyBuddies = suggestions && !hasTrainResults;

  return (
    <div className={`w-full ${
      suggestions && activeView !== 'buddies' ? 'hidden lg:block' : 'block'
    }`}>
      <Suggestions
        suggestions={suggestions}
        setSuggestions={setSuggestions}
      />
    </div>
  );
};

export default BuddySystemContainer;
