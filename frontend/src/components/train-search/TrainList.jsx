import React from 'react';
import TrainCard from './TrainCard';
import { useTrainContext } from '../../context/Context';

const TrainList = () => {
  const { trains, showTrainResults } = useTrainContext();

  if (!showTrainResults) return null;

  return (
    <div className="w-full animate-fade-in">
      {/* List */}
      <div className="max-h-[500px] overflow-y-auto space-y-3 pr-1 pb-6 scrollbar-thin">
        {trains.length > 0 ? (
          trains.map((train) => (
            <TrainCard key={train.train_number} train={train} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-surface-100 flex items-center justify-center">
              <svg className="w-7 h-7 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <p className="text-sm text-surface-500 font-medium">No trains found</p>
            <p className="text-xs text-surface-400">Try different stations or a different travel date</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainList;
