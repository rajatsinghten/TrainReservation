import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../utils/axios';

const StationInput = ({ 
  value, 
  onChange, 
  placeholder, 
  className = "",
  icon = "origin",
  onStationSelect 
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedStationCode, setSelectedStationCode] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const suggestionRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Sync local inputValue when external value prop changes (e.g. station swap)
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Flatten stations for keyboard navigation
  const allStations = suggestions.flatMap(cityData =>
    cityData.stations.map(s => ({ ...s, city: cityData.city }))
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (cityName) => {
    if (!cityName.trim() || cityName.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/api/stations/suggestions?city=${encodeURIComponent(cityName)}`
      );
      if (response.data.status && response.data.data.suggestions) {
        setSuggestions(response.data.data.suggestions);
        setShowSuggestions(true);
        setHighlightedIndex(-1);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error fetching station suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!newValue.trim()) {
      setSelectedStationCode('');
      setSuggestions([]);
      setShowSuggestions(false);
      onChange('');
      if (onStationSelect) onStationSelect('', '');
      return;
    }

    debounceRef.current = setTimeout(() => fetchSuggestions(newValue), 150);
    onChange(newValue);
  };

  const handleStationSelect = (stationName, stationCode, cityName, event) => {
    if (event) { event.preventDefault(); event.stopPropagation(); }
    const displayText = `${stationName} (${stationCode})`;
    setInputValue(displayText);
    setSelectedStationCode(stationCode);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    onChange(stationCode);
    if (onStationSelect) onStationSelect(stationCode, stationName, cityName);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || allStations.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(i => Math.min(i + 1, allStations.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      const s = allStations[highlightedIndex];
      handleStationSelect(s.stationName, s.stationCode, s.city);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  };

  const handleFocus = () => {
    if (suggestions.length > 0) setShowSuggestions(true);
    if (inputValue.trim() && inputValue.length >= 1) fetchSuggestions(inputValue);
  };

  const handleBlur = () => {
    setTimeout(() => { setShowSuggestions(false); setHighlightedIndex(-1); }, 300);
  };

  const OriginIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2M2 12h2m16 0h2" />
    </svg>
  );

  const DestinationIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  // Group stations by city for rendering
  const hasSuggestions = showSuggestions && suggestions.length > 0;
  const isEmpty = showSuggestions && suggestions.length === 0 && !loading && inputValue.trim().length >= 1;
  let globalIndex = 0;

  return (
    <div className="relative" ref={suggestionRef}>
      {/* Input with leading icon */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-surface-400">
          {icon === 'origin' ? <OriginIcon /> : <DestinationIcon />}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`${className} !pl-9 ${loading ? '!pr-9' : ''}`}
          autoComplete="off"
          autoCapitalize="words"
          autoCorrect="off"
          spellCheck="false"
          inputMode="text"
          role="combobox"
          aria-expanded={showSuggestions}
          aria-autocomplete="list"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-200 border-t-primary-600" />
          </div>
        )}
      </div>

      {/* Suggestions dropdown — Command palette style */}
      {hasSuggestions && (
        <div className="absolute z-[9999] w-full mt-1.5 bg-white border border-surface-200 rounded-xl shadow-2xl overflow-hidden animate-fade-in-down" role="listbox">
          {/* Search hint */}
          <div className="px-3 py-2 border-b border-surface-100 flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs text-surface-400 truncate">Stations matching "<span className="text-surface-600 font-medium">{inputValue}</span>"</span>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {suggestions.map((cityData, cityIndex) => {
              const cityHasMultiple = cityData.stations.length > 1;
              return (
                <div key={cityIndex}>
                  {/* City group label */}
                  {(cityHasMultiple || suggestions.length > 1) && (
                    <div className="px-3 pt-2 pb-1 flex items-center gap-1.5">
                      <svg className="w-3 h-3 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-surface-400">{cityData.city}</span>
                    </div>
                  )}
                  {cityData.stations.map((station, stationIndex) => {
                    const currentIndex = globalIndex++;
                    const isHighlighted = currentIndex === highlightedIndex;
                    return (
                      <div
                        key={`${cityIndex}-${stationIndex}`}
                        role="option"
                        aria-selected={isHighlighted}
                        className={`px-3 py-2.5 cursor-pointer transition-colors duration-100 flex items-center justify-between group ${
                          isHighlighted ? 'bg-primary-50' : 'hover:bg-surface-50'
                        }`}
                        onMouseDown={(e) => handleStationSelect(station.stationName, station.stationCode, cityData.city, e)}
                        onTouchStart={(e) => handleStationSelect(station.stationName, station.stationCode, cityData.city, e)}
                        onMouseEnter={() => setHighlightedIndex(currentIndex)}
                        style={{ minHeight: '40px', WebkitTapHighlightColor: 'rgba(59, 108, 252, 0.08)' }}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`p-1.5 rounded-lg flex-shrink-0 transition-colors ${
                            isHighlighted ? 'bg-primary-100 text-primary-600' : 'bg-surface-100 text-surface-500 group-hover:bg-surface-200'
                          }`}>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-surface-800 truncate">{station.stationName}</span>
                        </div>
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md flex-shrink-0 ml-2 ${
                          isHighlighted ? 'bg-primary-100 text-primary-700' : 'bg-surface-100 text-surface-500'
                        }`}>
                          {station.stationCode}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isEmpty && (
        <div className="absolute z-[9999] w-full mt-1.5 bg-white border border-surface-200 rounded-xl shadow-xl">
          <div className="px-4 py-5 text-center">
            <div className="w-8 h-8 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-surface-600">No stations found</p>
            <p className="text-xs text-surface-400 mt-0.5">Try a different city or station name</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StationInput;
