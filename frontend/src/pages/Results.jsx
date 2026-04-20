import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout';
import { TrainSearchContainer } from '../components/train-search';
import SearchForm from '../components/train-search/SearchForm';
import { useTrainContext } from '../context/Context';

const Results = () => {
  const navigate = useNavigate();
  const { showTrainResults, trains } = useTrainContext();

  const hasTrainResults = showTrainResults && trains && trains.length > 0;

  if (!showTrainResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-surface-50 via-primary-50/30 to-surface-50 relative overflow-hidden">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen gap-3">
          <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mb-2">
            <svg className="w-8 h-8 text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-surface-900">No results to display</h2>
          <p className="text-sm text-surface-500">Try searching for a different route or date.</p>
          <button onClick={() => navigate('/')} className="btn-primary btn-sm mt-2">Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-primary-50/30 to-surface-50 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 -left-32 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-32 w-96 h-96 bg-accent-200/20 rounded-full blur-3xl" />
      </div>

      <Navbar />
      <SearchForm />

      <div className="flex flex-col items-center relative w-full max-w-4xl mx-auto px-4 sm:px-6 gap-4 pt-32 lg:pt-36 pb-12">
        <div className="w-full">
          <TrainSearchContainer />
        </div>
      </div>
    </div>
  );
};

export default Results;
