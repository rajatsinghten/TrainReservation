import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StationInput from "./StationInput";
import { useTrainContext } from "../../context/Context";
import useMediaQuery from "../../utils/useMediaQuery";
import { Spinner } from "../ui";

const SearchForm = ({ inline = false }) => {
  const navigate = useNavigate();
  const {
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
    searchTrains,
    loading,
    error,
    setError,
    trains,
    searchInitiated,
    setSearchInitiated,
    showTrainResults,
  } = useTrainContext();

  const hasSearchResults = showTrainResults && trains.length > 0;
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);
  const isSmallScreen = useMediaQuery('(max-width: 1023px)');

  useEffect(() => {
    if (searchInitiated && isSmallScreen) {
      setIsFormCollapsed(true);
    } else if (!searchInitiated) {
      setIsFormCollapsed(false);
    }
  }, [searchInitiated, isSmallScreen]);

  const handleSearchTrains = async (e) => {
    e.preventDefault();
    const success = await searchTrains();
    if (success) navigate('/results');
  };

  const handleSwapStations = () => {
    const tempStation = fromStation;
    const tempCode = fromStationCode;
    setFromStation(toStation);
    setFromStationCode(toStationCode);
    setToStation(tempStation);
    setToStationCode(tempCode);
  };

  const shouldShowCollapsedBar = searchInitiated && isSmallScreen;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // ── Inline (landing page) rendering ──────────────────────────
  if (inline) {
    return (
      <div className="w-full">
        <form className="flex flex-col gap-4" onSubmit={handleSearchTrains}>
          <div>
            <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5 ml-1">From</label>
            <StationInput
              value={fromStation}
              onChange={setFromStation}
              onStationSelect={(code, name) => { setFromStationCode(code); setFromStation(name); setError(null); }}
              placeholder="Boarding station"
              icon="origin"
              className="input !py-3 !rounded-xl w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5 ml-1">To</label>
            <StationInput
              value={toStation}
              onChange={setToStation}
              onStationSelect={(code, name) => { setToStationCode(code); setToStation(name); setError(null); }}
              placeholder="Destination station"
              icon="destination"
              className="input !py-3 !rounded-xl w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5 ml-1">Date</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input pl-9 !py-3 !rounded-xl w-full"
                value={selectedDate}
                type="date"
              />
            </div>
          </div>

          <div className="pt-1">
            <button
              onClick={handleSearchTrains}
              className="btn-primary !py-3 w-full"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <><Spinner size="sm" className="text-white" />Searching…</>
              ) : (
                <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>Search Trains</>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-3 flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <svg className="w-4 h-4 flex-shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
      </div>
    );
  }

  // Collapsed mini-bar for mobile
  if (shouldShowCollapsedBar && isFormCollapsed) {
    return (
      <div className="fixed top-16 left-0 right-0 z-[50] px-4 pt-3">
        <button
          onClick={() => { setIsFormCollapsed(false); setSearchInitiated(false); }}
          className="w-full bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg border border-surface-200/80 hover:shadow-xl transition-all flex items-center justify-between group max-w-6xl mx-auto overflow-hidden"
        >
          <div className="flex items-center gap-0 flex-1 min-w-0">
            <div className="p-3.5 pl-4 flex-shrink-0">
              <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="h-8 w-px bg-surface-200 flex-shrink-0" />
            <div className="px-3 py-3 text-left min-w-0 flex-1">
              <div className="font-semibold text-sm text-surface-800 truncate">
                {fromStation && toStation ? `${fromStation} → ${toStation}` : "Search Trains"}
              </div>
              {selectedDate && (
                <div className="text-xs text-surface-500">{formatDate(selectedDate)}</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 flex-shrink-0">
            <span className="text-xs text-primary-600 font-medium hidden sm:block">Modify</span>
            <svg className="w-4 h-4 text-surface-400 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed left-0 right-0 z-[100] ${
      hasSearchResults ? 'top-16' : 'top-0 bottom-0 flex items-center justify-center'
    }`}>
      <div
        className={`${
          hasSearchResults ? "mx-4 sm:mx-auto mt-3" : "mx-4 sm:mx-auto"
        } w-full max-w-6xl`}
      >
        {!hasSearchResults && (
          <div className="lg:hidden text-center mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 border border-primary-100 rounded-full text-xs font-semibold text-primary-700 mb-3">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Fast & Secure Reservations
            </div>
            <h1 className="text-2xl font-bold text-surface-900 tracking-tight font-display">Find Your Train</h1>
            <p className="text-sm text-surface-500 mt-1">Book tickets instantly with our professional system</p>
          </div>
        )}

        <form
          className={`bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-surface-200/70 transition-all ${
            hasSearchResults ? "p-3 md:p-4" : "p-5 md:p-6 lg:p-7"
          }`}
          onSubmit={handleSearchTrains}
        >
          {!hasSearchResults && (
            <div className="hidden lg:flex items-center gap-2 mb-5">
              <div className="p-1.5 bg-primary-50 rounded-lg">
                <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-surface-700 uppercase tracking-widest font-display">Reservation Desk</span>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-3 lg:items-end">
            <div className="flex flex-col md:flex-row gap-3 w-full lg:flex-1 relative">
              <div className="flex-1">
                {!hasSearchResults && (
                  <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5 ml-1">
                    From
                  </label>
                )}
                <StationInput
                  value={fromStation}
                  onChange={setFromStation}
                  onStationSelect={(code, name) => {
                    setFromStationCode(code);
                    setFromStation(name);
                    setError(null);
                  }}
                  placeholder="Boarding station"
                  icon="origin"
                  className={`input ${hasSearchResults ? "!py-2.5" : "!py-3"} !rounded-xl w-full`}
                />
              </div>

              <div className={`flex items-${hasSearchResults ? 'center' : 'end'} justify-center flex-shrink-0`}>
                <button
                  type="button"
                  onClick={handleSwapStations}
                  className="p-2 bg-surface-50 border border-surface-200 rounded-xl hover:bg-primary-50 hover:border-primary-200 hover:text-primary-600 text-surface-400 transition-all duration-200 group"
                  title="Swap stations"
                >
                  <svg className="w-4 h-4 rotate-90 md:rotate-0 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </button>
              </div>

              <div className="flex-1">
                {!hasSearchResults && (
                  <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5 ml-1">
                    To
                  </label>
                )}
                <StationInput
                  value={toStation}
                  onChange={setToStation}
                  onStationSelect={(code, name) => {
                    setToStationCode(code);
                    setToStation(name);
                    setError(null);
                  }}
                  placeholder="Destination station"
                  icon="destination"
                  className={`input ${hasSearchResults ? "!py-2.5" : "!py-3"} !rounded-xl w-full`}
                />
              </div>
            </div>

            <div className={`flex-shrink-0 ${hasSearchResults ? '' : 'md:min-w-[180px]'}`}>
              {!hasSearchResults && (
                <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5 ml-1">
                  Date
                </label>
              )}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={`input pl-9 ${hasSearchResults ? "!py-2.5" : "!py-3"} !rounded-xl w-full`}
                  value={selectedDate}
                  type="date"
                />
              </div>
            </div>

            <div className="flex-shrink-0">
              <button
                type="submit"
                disabled={loading}
                className={`btn-primary ${hasSearchResults ? "!py-2.5 !px-5" : "!py-3 !px-8"} w-full sm:w-auto whitespace-nowrap shadow-lg shadow-primary-600/20 active:scale-95 transition-transform`}
              >
                {loading ? (
                  <><Spinner size="sm" className="text-white" />Searching…</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>Search Trains</>
                )}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="mt-2">
            <div className="flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <svg className="w-4 h-4 flex-shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchForm;
