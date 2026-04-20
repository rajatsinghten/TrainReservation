import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axios";
import ClassInfo from "./ClassInfo";
import { Spinner } from "../ui";

const TrainCard = ({ train }) => {
  const [isListing, setIsListing] = useState(false);
  const [listingError, setListingError] = useState(null);
  const [listingSuccess, setListingSuccess] = useState(false);
  const [isListed, setIsListed] = useState(false);
  const [userData, setUserData] = useState(null);
  const [unlistSuccess, setUnlistSuccess] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");

  useEffect(() => {
    const checkUserListing = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axiosInstance.get('/api/users/me');
        
        if (response.data.success) {
          setUserData(response.data.user);
            const travelStatus = response.data.user.travelStatus;
          if (travelStatus && 
              travelStatus.isActive && 
              travelStatus.boardingStation === train.fromStation?.code && 
              travelStatus.destinationStation === train.toStation?.code && 
              travelStatus.trainNumber === train.trainNumber) {
            
            let trainDate;
            if (train.train_date) {
              const dateParts = train.train_date.split('-');
              if (dateParts.length === 3) {
                trainDate = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
              } else {
                trainDate = new Date(train.train_date);
              }
            } else {
              trainDate = new Date();
            }
            
            const userDate = new Date(travelStatus.travelDate);
            
            if (trainDate.toDateString() === userDate.toDateString()) {
              setIsListed(true);
              setListingSuccess(true);
              if (travelStatus.preferredClass) {
                setSelectedClass(travelStatus.preferredClass);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error checking user listing:", error);
      }
    };

    checkUserListing();
  }, [train]);

  const handleClassSelect = (classType) => {
    setSelectedClass(classType);
  };

  const handleListYourself = async () => {
    if (isListed) {
      await performListingAction();
      return;
    }
    
    if (!selectedClass) {
      setListingError("Please select a travel class before listing yourself");
      return;
    }
    
    await performListingAction();
  };
  
  const performListingAction = async () => {
    setIsListing(true);
    setListingError(null);
    setUnlistSuccess(false);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setListingError("Please login to list yourself on this train");
        setIsListing(false);
        return;
      }

      if (isListed) {
        const travelStatusData = {
          boardingStation: "",
          destinationStation: "",
          travelDate: null,
          trainNumber: "",
          preferredClass: "",
          isActive: false
        };

        const response = await axiosInstance.put('/api/users/travel-status', travelStatusData);
        if (response.data.success) {
          setIsListed(false);
          setListingSuccess(false);
          setUnlistSuccess(true);
          setTimeout(() => setUnlistSuccess(false), 3000);
        } else {
          setListingError("Failed to unlist from this train");
        }
      } else {
        let trainDate;
        try {
          if (train.train_date) {
            const dateParts = train.train_date.split('-');
            if (dateParts.length === 3) {
              trainDate = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
            } else {
              trainDate = new Date(train.train_date);
            }
          } else {
            trainDate = new Date();
          }
        } catch (error) {
          console.error('Error parsing train date:', error);
          trainDate = new Date();
        }

        const travelStatusData = {
          boardingStation: train.fromStation?.code || train.from,
          destinationStation: train.toStation?.code || train.to,
          travelDate: trainDate.toISOString(),
          trainNumber: train.trainNumber || train.train_number,
          preferredClass: selectedClass,
          isActive: true
        };

        const response = await axiosInstance.put('/api/users/travel-status', travelStatusData);
        if (response.data.success) {
          setIsListed(true);
          setListingSuccess(true);
        } else {
          setListingError("Failed to list yourself on this train");
        }
      }
    } catch (error) {
      console.error('Error updating travel status:', error);
      setListingError(error.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setIsListing(false);
    }
  };

  const durationText = train.duration
    ? `${Math.floor(train.duration / 60)}h ${train.duration % 60}m`
    : null;

  const trainName = train.trainName || train.train_name;
  const trainNumber = train.trainNumber || train.train_number;
  const fromCode = train.fromStation?.code || train.from;
  const fromName = train.fromStation?.name || train.from_station_name;
  const toCode = train.toStation?.code || train.to;
  const toName = train.toStation?.name || train.to_station_name;
  const departure = train.departureTime || train.from_std;
  const arrival = train.arrivalTime || train.to_sta;

  return (
    <li className="bg-white w-full rounded-xl border border-surface-200 shadow-sm hover:shadow-md hover:border-surface-300 transition-all duration-200 overflow-hidden animate-fade-in">
      {isListed && listingSuccess && (
        <div className="h-0.5 bg-gradient-to-r from-accent-400 via-accent-500 to-accent-400" />
      )}

      <div className="px-3.5 py-2.5">
        {/* Row 1: Train name + number + date */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h3 className="text-sm font-bold text-surface-900 truncate leading-tight">{trainName}</h3>
            {isListed && listingSuccess && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-accent-50 text-accent-700 border border-accent-200 rounded-full text-[9px] font-bold uppercase tracking-wide flex-shrink-0">
                <span className="w-1 h-1 rounded-full bg-accent-500 animate-pulse" />
                Listed
              </span>
            )}
            <span className="text-[10px] font-mono text-surface-400 flex-shrink-0">#{trainNumber}</span>
          </div>
          {train.train_date && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 border border-primary-100 rounded-md text-[10px] font-semibold text-primary-700 flex-shrink-0">
              {train.train_date}
            </span>
          )}
        </div>

        {/* Row 2: Route — compact inline */}
        <div className="flex items-center gap-2 bg-surface-50 rounded-lg px-3 py-2 mb-2">
          {/* Departure */}
          <div className="flex-1 min-w-0">
            <span className="text-sm font-bold text-surface-900 tabular-nums">{departure || '—'}</span>
            <span className="text-[10px] text-surface-500 ml-1.5 font-mono uppercase">{fromCode}</span>
            <p className="text-[10px] text-surface-500 truncate leading-tight mt-0.5">{fromName}</p>
          </div>

          {/* Journey line */}
          <div className="flex flex-col items-center gap-0.5 flex-shrink-0 px-2">
            {durationText && (
              <span className="text-[9px] font-semibold text-surface-400 whitespace-nowrap">{durationText}</span>
            )}
            <div className="flex items-center gap-0.5">
              <div className="w-1 h-1 rounded-full bg-primary-400" />
              <div className="w-10 md:w-16 h-px bg-gradient-to-r from-primary-300 via-primary-400 to-primary-300" />
              <div className="w-0 h-0 border-y-[3px] border-y-transparent border-l-[5px] border-l-primary-500" />
            </div>
            {train.distance && (
              <span className="text-[9px] text-surface-400">{train.distance} km</span>
            )}
          </div>

          {/* Arrival */}
          <div className="flex-1 min-w-0 text-right">
            <span className="text-sm font-bold text-surface-900 tabular-nums">{arrival || '—'}</span>
            <span className="text-[10px] text-surface-500 ml-1.5 font-mono uppercase">{toCode}</span>
            <p className="text-[10px] text-surface-500 truncate leading-tight mt-0.5">{toName}</p>
          </div>
        </div>

        {/* Row 3: Class selection */}
        <div className="border-t border-surface-100 pt-2 mb-2">
          <ClassInfo
            train={train}
            selectedClass={selectedClass}
            onClassSelect={handleClassSelect}
          />
        </div>

        {/* Row 4: Action */}
        {isListed && listingSuccess ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-accent-50 border border-accent-200 rounded-lg flex-1 min-w-0">
              <svg className="w-3 h-3 text-accent-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-[11px] text-accent-800 font-medium truncate">
                Listed · <span className="font-bold">{selectedClass}</span>
              </span>
            </div>
            <button onClick={handleListYourself} disabled={isListing} className="btn-danger btn-sm flex-shrink-0">
              {isListing ? "…" : "Unlist"}
            </button>
          </div>
        ) : unlistSuccess ? (
          <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary-50 border border-primary-100 rounded-lg text-xs text-primary-700 font-medium">
            <svg className="w-3.5 h-3.5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Unlisted successfully
          </div>
        ) : selectedClass ? (
          <button onClick={handleListYourself} disabled={isListing} className="btn-primary btn-sm w-full">
            {isListing
              ? <><Spinner size="sm" className="text-white" />Processing…</>
              : <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>List Yourself</>
            }
          </button>
        ) : (
          <p className="text-center text-[10px] text-surface-400">↑ Select a class to list yourself</p>
        )}

        {listingError && (
          <div className="mt-1.5 flex items-center gap-1.5 px-2.5 py-1.5 bg-red-50 border border-red-200 rounded-lg text-[11px] text-red-700">
            <svg className="w-3 h-3 flex-shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {listingError}
          </div>
        )}
      </div>
    </li>
  );
};

export default TrainCard;