import React from "react";
import { useNavigate } from "react-router-dom";
import StationInput from "./StationInput";
import { useTrainContext } from "../../context/Context";
import { Spinner } from "../ui";

const SearchForm = ({ inline = false }) => {
  const navigate = useNavigate();
  const {
    toStation,
    setToStation,
    fromStation,
    setFromStation,
    setToStationCode,
    setFromStationCode,
    selectedDate,
    setSelectedDate,
    searchTrains,
    loading,
    error,
    setError,
    showTrainResults,
  } = useTrainContext();

  const handleSearchTrains = async (e) => {
    e.preventDefault();
    const success = await searchTrains();
    if (success) navigate('/results');
  };

  const hasResults = showTrainResults;

  if (inline) {
    return (
      <form className="space-y-4" onSubmit={handleSearchTrains}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <span className="absolute -top-2 left-3 bg-white px-1 text-[8px] font-black uppercase tracking-widest z-10">Boarding</span>
            <StationInput
              value={fromStation}
              onChange={setFromStation}
              onStationSelect={(code, name) => { setFromStationCode(code); setFromStation(name); setError(null); }}
              placeholder="Origin"
              className="input w-full"
            />
          </div>
          <div className="relative">
            <span className="absolute -top-2 left-3 bg-white px-1 text-[8px] font-black uppercase tracking-widest z-10">Destination</span>
            <StationInput
              value={toStation}
              onChange={setToStation}
              onStationSelect={(code, name) => { setToStationCode(code); setToStation(name); setError(null); }}
              placeholder="To"
              className="input w-full"
            />
          </div>
        </div>
        <div className="relative">
          <span className="absolute -top-2 left-3 bg-white px-1 text-[8px] font-black uppercase tracking-widest z-10">Travel Date</span>
          <input
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input w-full"
            value={selectedDate}
            type="date"
          />
        </div>
        <button
          className="btn btn-primary w-full py-4 text-xs tracking-[0.3em]"
          type="submit"
          disabled={loading}
        >
          {loading ? <Spinner size="sm" /> : "SEARCH"}
        </button>
        {error && <p className="text-[10px] text-red-600 font-bold uppercase text-center">{error}</p>}
      </form>
    );
  }

  return (
    <div className={`fixed left-0 right-0 z-[100] ${hasResults ? 'top-16 bg-white border-b-2 border-black' : 'hidden'}`}>
      <div className="max-w-6xl mx-auto px-6 py-4">
        <form className="flex flex-col md:flex-row gap-4 items-end" onSubmit={handleSearchTrains}>
          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-3">
             <StationInput
                value={fromStation}
                onChange={setFromStation}
                onStationSelect={(code, name) => { setFromStationCode(code); setFromStation(name); }}
                placeholder="From"
                className="input !py-2 !text-xs"
              />
              <StationInput
                value={toStation}
                onChange={setToStation}
                onStationSelect={(code, name) => { setToStationCode(code); setToStation(name); }}
                placeholder="To"
                className="input !py-2 !text-xs"
              />
              <input
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input !py-2 !text-xs"
                value={selectedDate}
                type="date"
              />
          </div>
          <button className="btn btn-primary !py-2 !px-8" type="submit" disabled={loading}>
            {loading ? <Spinner size="sm" /> : "FIND"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SearchForm;
