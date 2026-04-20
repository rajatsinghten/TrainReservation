import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout';
import SearchForm from '../components/train-search/SearchForm';
import TrainList from '../components/train-search/TrainList';
import { useTrainContext } from '../context/Context';

const Results = () => {
  const navigate = useNavigate();
  const { showTrainResults, trains } = useTrainContext();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <SearchForm />

      <div className="max-w-6xl mx-auto px-6 pt-40 pb-20">
        <div className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b-4 border-black pb-4">
            <h2 className="text-2xl font-black uppercase tracking-tighter">Available Trains</h2>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-30">
              {trains.length} Services Found
            </p>
          </div>
          
          <div className="animate-minimal-in">
            {showTrainResults ? (
               <TrainList />
            ) : (
              <div className="py-20 text-center space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-30">No results found</p>
                <button onClick={() => navigate('/')} className="btn btn-primary">GO BACK</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
