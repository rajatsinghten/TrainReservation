import React from 'react';
import { useTrainContext } from '../../context/Context';

const ViewSwitcher = () => {
  const { list, suggestions, activeView, toggleView } = useTrainContext();

  // Only show switcher when both trains and buddies are available on smaller screens
  if (!list && !suggestions) {
    return null;
  }

  return (
    <div className="lg:hidden flex justify-center mb-4 w-full">
      <div className="bg-surface-100 rounded-xl p-1 inline-flex">
        <button
          onClick={() => toggleView('trains')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeView === 'trains'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-surface-500 hover:text-surface-700'
          }`}
          disabled={!list}
        >
          Trains
        </button>
        <button
          onClick={() => toggleView('buddies')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeView === 'buddies'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-surface-500 hover:text-surface-700'
          }`}
          disabled={!suggestions}
        >
          Buddies
        </button>
      </div>
    </div>
  );
};

export default ViewSwitcher;
